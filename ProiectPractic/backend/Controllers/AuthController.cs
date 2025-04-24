using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly TotpService _totpService;
    private const string SecretKey = "ThisIsAVerySecureKeyWithAtLeast32Characters1234567890";

    public AuthController(ApplicationDbContext context, TotpService totpService)
    {
        _context = context;
        _totpService = totpService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserRegisterModel model)
    {
        if (string.IsNullOrEmpty(model.Username) || string.IsNullOrEmpty(model.Password) || string.IsNullOrEmpty(model.Email))
        {
            return BadRequest("Username, email, and password are required");
        }

        if (!IsValidEmail(model.Email))
        {
            return BadRequest("Invalid email format");
        }

        if (await _context.Users.AnyAsync(u => u.Username == model.Username) ||
            await _context.Users.AnyAsync(u => u.Email == model.Email))
        {
            return BadRequest("Username or email is already taken");
        }

        var user = new User
        {
            Username = model.Username,
            Email = model.Email,
            PasswordHash = HashPassword(model.Password),
            VerificationCode = new Random().Next(100000, 999999).ToString(),
            IsVerified = false,
            LoginVerificationCode = new Random().Next(100000, 999999).ToString()
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var emailService = new EmailService();
        await emailService.SendVerificationEmailAsync(user.Email, user.VerificationCode);

        return Ok(new { message = "User registered successfully. Please verify your email." });
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailModel model)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
        if (user == null)
        {
            return BadRequest("Invalid email.");
        }

        if (user.VerificationCode != model.VerificationCode)
        {
            return BadRequest("Invalid verification code.");
        }

        user.IsVerified = true;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Email verified successfully!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestModel model)
    {
        if (string.IsNullOrEmpty(model.UsernameOrEmail) || string.IsNullOrEmpty(model.Password))
        {
            return BadRequest("Username/email and password are required");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u =>
            u.Username == model.UsernameOrEmail ||
            u.Email == model.UsernameOrEmail);

        if (user != null && VerifyPassword(model.Password, user.PasswordHash))
        {
            var verificationCode = new Random().Next(100000, 999999).ToString();
            user.LoginVerificationCode = verificationCode;
            await _context.SaveChangesAsync();

            var emailService = new EmailService();
            await emailService.SendAuthAsync(user.Email, verificationCode);

            return Ok(new { message = "Verification code sent to email." });
        }

        return Unauthorized("Invalid credentials");
    }

    [HttpPost("login_verification")]
    public async Task<IActionResult> LoginVerification([FromBody] LoginVerificationModel model)
    {

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email || u.Username == model.Username);
        if (user == null)
        {
            return BadRequest("Invalid email.");
        }

        if (user.LoginVerificationCode != model.VerificationCode)
        {
            return BadRequest("Invalid verification code.");
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(SecretKey);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, user.Username) }),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return Ok(new { token = tokenHandler.WriteToken(token) });
    }



    private bool IsValidEmail(string email)
    {
        try {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch {
            return false;
        }
    }

    private string HashPassword(string password)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }

    private bool VerifyPassword(string password, string hash)
    {
        return HashPassword(password) == hash;
    }

    [HttpPost("enable-totp")]
    [Authorize]
    public async Task<IActionResult> EnableTotp()
    {
        // Get the username from the token
        var username = User.Identity.Name;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

        if (user == null)
        {
            return NotFound("User not found");
        }

        // Generate a new secret key
        var secretKey = _totpService.GenerateSecretKey();
        user.TotpSecretKey = secretKey;

        await _context.SaveChangesAsync();

        // Generate QR code
        var qrCodeBytes = _totpService.GenerateQrCodeBytes(secretKey, user.Username);

        return Ok(new 
        { 
            secretKey = secretKey,
            qrCodeBase64 = Convert.ToBase64String(qrCodeBytes)
        });
    }

    [HttpPost("verify-totp")]
    [Authorize]
    public async Task<IActionResult> VerifyTotp([FromBody] VerifyTotpModel model)
    {
        // Get the username from the token
        var username = User.Identity.Name;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

        if (user == null)
        {
            return NotFound("User not found");
        }

        // Verify the TOTP code
        if (!_totpService.VerifyTotp(user.TotpSecretKey, model.TotpCode))
        {
            return BadRequest("Invalid TOTP code");
        }

        // Enable TOTP for the user
        user.IsTotpEnabled = true;
        await _context.SaveChangesAsync();

        return Ok(new { message = "TOTP authentication enabled successfully" });
    }

    [HttpPost("login-with-totp")]
    public async Task<IActionResult> LoginWithTotp([FromBody] LoginWithTotpModel model)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => 
            u.Username == model.UsernameOrEmail || 
            u.Email == model.UsernameOrEmail);

        if (user == null)
        {
            return BadRequest("Invalid username or email");
        }

        if (!user.IsTotpEnabled)
        {
            return BadRequest("TOTP authentication is not enabled for this user");
        }

        // Verify the TOTP code
        if (!_totpService.VerifyTotp(user.TotpSecretKey, model.TotpCode))
        {
            return BadRequest("Invalid TOTP code");
        }

        // Generate JWT token
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(SecretKey);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, user.Username) }),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return Ok(new { token = tokenHandler.WriteToken(token) });
    }
}

public class VerifyEmailModel
{
    public string Email { get; set; }
    public string VerificationCode { get; set; }
}

public class LoginVerificationModel
{
    public string Email { get; set; }
    public string Username { get; set; }
    public string VerificationCode { get; set; }
}

public class VerifyTotpModel
{
    public string TotpCode { get; set; }
}

public class LoginWithTotpModel
{
    public string UsernameOrEmail { get; set; }
    public string TotpCode { get; set; }
}

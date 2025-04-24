using MailKit.Net.Smtp;
using MimeKit;
using System.Threading.Tasks;
using DotNetEnv;
public class EmailService
{
    private readonly string _smtpServer = "smtp.office365.com";
    private readonly int _smtpPort = 587; // Usually 587 for TLS, or 465 for SSL
    private readonly string _smtpUser = Environment.GetEnvironmentVariable("SMTP_USER");
    private readonly string _smtpPass = Environment.GetEnvironmentVariable("SMTP_PASS");
    public async Task SendVerificationEmailAsync(string recipientEmail, string verificationCode)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("SSC Project", _smtpUser));
        message.To.Add(new MailboxAddress("", recipientEmail));
        message.Subject = "Email Verification";

        message.Body = new TextPart("plain")
        {
            Text = $"Verification code: {verificationCode}"
        };

        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync(_smtpServer, _smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_smtpUser, _smtpPass);
            await client.SendAsync(message);
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
    }
    public async Task SendAuthAsync(string recipientEmail, string verificationCode)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("SSC Project", _smtpUser));
            message.To.Add(new MailboxAddress("", recipientEmail));
            message.Subject = "Auth Verification";

            message.Body = new TextPart("plain")
            {
                Text = $"Verification code: {verificationCode}"
            };

            using var client = new SmtpClient();
            try
            {
                await client.ConnectAsync(_smtpServer, _smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_smtpUser, _smtpPass);
                await client.SendAsync(message);
            }
            finally
            {
                await client.DisconnectAsync(true);
            }
        }
}

public class LoginRequestModel
    {
        public string UsernameOrEmail { get; set; }
        public string Password { get; set; }
    }
public class VerificationRequestModel
    {
        public int UserId { get; set; }
        public string Code { get; set; }
    }
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string VerificationCode { get; set; } = string.Empty;
    public bool IsVerified { get; set; } = false;
    public string LoginVerificationCode { get; set; } = string.Empty;
    public string TotpSecretKey { get; set; } = string.Empty;
    public bool IsTotpEnabled { get; set; } = false;
}

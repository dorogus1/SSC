using OtpNet;
using QRCoder;
using System;
using System.Drawing;
using System.IO;

public class TotpService
{
    private const int SecretKeyLength = 20; // 160 bits as recommended for TOTP
    private const int DefaultStep = 30; // Default time step in seconds
    private const int DefaultDigits = 6; // Default number of digits in TOTP code


    public string GenerateSecretKey()
    {
        var secretKey = KeyGeneration.GenerateRandomKey(SecretKeyLength);
        return Base32Encoding.ToString(secretKey);
    }

    public byte[] GenerateQrCodeBytes(string secretKey, string username, string issuer = "SSC Project")
    {
        var totpUri = $"otpauth://totp/{Uri.EscapeDataString(issuer)}:{Uri.EscapeDataString(username)}?secret={secretKey}&issuer={Uri.EscapeDataString(issuer)}&algorithm=SHA1&digits={DefaultDigits}&period={DefaultStep}";

        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(totpUri, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);
        return qrCode.GetGraphic(20);
    }

    public bool VerifyTotp(string secretKey, string totpCode)
    {
        try
        {
            var secretKeyBytes = Base32Encoding.ToBytes(secretKey);
            var totp = new Totp(secretKeyBytes, step: DefaultStep, totpSize: DefaultDigits);
            return totp.VerifyTotp(totpCode, out _, VerificationWindow.RfcSpecifiedNetworkDelay);
        }
        catch
        {
            return false;
        }
    }
}
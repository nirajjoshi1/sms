import QRCode from 'qrcode';

export const createQrDataUrl = (value, width = 180) => QRCode.toDataURL(value, {
  width,
  margin: 1,
  errorCorrectionLevel: 'M',
  color: { dark: '#0f172a', light: '#ffffff' }
});

export const buildQrImageMap = async (people) => Object.fromEntries(
  await Promise.all((people || []).map(async person => [
    person.id,
    person.qrIdentity?.verificationUrl
      ? await createQrDataUrl(person.qrIdentity.verificationUrl)
      : null
  ]))
);

import QRCode from 'qrcode'

const generateQR = async text => {
    try {
        const qrCode = await QRCode.toDataURL(text, { errorCorrectionLevel: 'M', version: 8 })
        console.log(qrCode)
        return qrCode
    } catch (err) {
        console.error(err)
    }
}

export default generateQR;
import QRCode from require('qrcode')

export default generateQR = async text => {
    try {
        const qrCode = await QRCode.toDataURL(text, { errorCorrectionLevel: 'M', version: 8 })
        console.log(qrCode)
        return qrCode
    } catch (err) {
        console.error(err)
    }
}
import QRCode from 'qrcode'
import toastError from './toastError'

const generateQR = async text => {
    try {
        const qrCode = await QRCode.toDataURL(text, { errorCorrectionLevel: 'M', version: 8 })
        return qrCode
    } catch (err) {
        toastError(err.message)
    }
}

export default generateQR;
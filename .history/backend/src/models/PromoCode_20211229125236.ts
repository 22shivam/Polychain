import mongoose from 'mongoose';
// write a user model 

// interface that describes properties needed to create a user
export interface promoCodeAttr {
    promoCode: string;
}

// interface that describes the properties a user model has
interface PromoCodeModel extends mongoose.Model<PromoCodeDoc> {
    build(attrs: promoCodeAttr): PromoCodeDoc;
}

// interface that describes a property that a user document has
interface PromoCodeDoc extends mongoose.Document, promoCodeAttr {

}

const PromoCodeSchema = new mongoose.Schema({
    promoCode: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: false,
    }


})

PromoCodeSchema.statics.build = (attr: promoCodeAttr) => {
    return new PromoCode(attr)

}

const PromoCode = mongoose.model<PromoCodeDoc, PromoCodeModel>('PromoCode', PromoCodeSchema);


export default PromoCode

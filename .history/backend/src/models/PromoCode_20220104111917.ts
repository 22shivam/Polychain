import mongoose from 'mongoose';
// write a promocode model 

// interface that describes properties needed to create a promocode
export interface promoCodeAttr {
    promoCode: string;
    address?: string;
    blockchain?: string;
}

// interface that describes the properties a promocode model has
interface PromoCodeModel extends mongoose.Model<PromoCodeDoc> {
    build(attrs: promoCodeAttr): PromoCodeDoc;
}

// interface that describes a property that a promocode document has
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
        default: ""
    },
    blockchain: {
        type: String,
        enum: ["eth", "sol"],
        required: false
    }
})

PromoCodeSchema.statics.build = (attr: promoCodeAttr) => {
    return new PromoCode(attr)
}

const PromoCode = mongoose.model<PromoCodeDoc, PromoCodeModel>('PromoCode', PromoCodeSchema);


export default PromoCode

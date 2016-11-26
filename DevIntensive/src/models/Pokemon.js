import mongoose from 'mongoose';
import _ from 'lodash';
const { Schema } = mongoose;

const PokemonSchema = new Schema({
	_id: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	height: {
		type: Number,
		required: true
	},
	weight: {
		type: Number,
		required: true
	}
});
// PokemonSchema.methods.toJSON = function() {
// 	return _.pick(this, ['id', 'name']);
// };

export default mongoose.model('Pokemon', PokemonSchema);
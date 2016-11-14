import Pet from './models/Pet';
import User from './models/User';

export default async function saveDataInDB(data) {
	try {
		console.log('data', data);
		const user = new User(data.user);
		await user.save();
		const promises = data.pets.map((pet) => {
			const petData = Object.assign({}, pet, {
				owner: user._id
			});
			return (new Pet(petData)).save();
		});
		console.log('success');
		return {
			user,
			pets: await Promise.all(promises)
		}
	} catch (err) {
		console.log('error', err);
		throw err;
	}
}
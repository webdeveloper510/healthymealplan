import { FilesCollection } from 'meteor/ostrio:files';
import { Roles } from 'meteor/alanning:roles';

const PlateImages = new FilesCollection({
  collectionName: 'PlateImages',
  // storagePath: '/Healthy Meal Plan/data',
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size >= 10485760 && /png|jpg|jpeg/i.test(file.extension) === false) {
      return 'Please upload image, with size equal or less than 10MB';
    }

    // if (!Roles.userIsInRole(this.userId, ['super-admin'])) {
    //   return 'You\'re not authorized';
    // }

    return true;
  },
});

// PlateImages.allow({
//   insert: () => true,
//   update: () => true,
//   remove: () => true,
// });


export default PlateImages;

import Swal from 'sweetalert2';
import queryRequest from '../../utils/queryRequest';

const compressInstallsInVehicle = (installs) => {
  const uniqueInstalls = {};
  for (const install of installs) {
    if (uniqueInstalls[install.placement._id])
      uniqueInstalls[install.placement._id].count += install.count;
    else uniqueInstalls[install.placement._id] = install;
  }
  return Object.values(uniqueInstalls);
};

const handleAdRemoving = (vehicle_id, placement_id, t, cb) => {
  const query = `mutation{removeAd(vehicle:"${vehicle_id}",placement:"${placement_id}")}`;

  Swal.fire({
    title: t('i.remove.form.confirm.title'),
    text: t('i.remove.form.confirm.text'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: t('i.remove.form.confirm.yes'),
  }).then((result) => {
    if (result.value) removeAdd(query, t, cb);
  });
};

const removeAdd = async (query, t, cb) => {
  try {
    const { removeAd } = await queryRequest(query);

    if (removeAd) {
      if (cb) cb();

      Swal.fire({
        title: 'Removed!',
        text: `${removeAd} ${t('i.remove.form.success.text')}`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: t('i.remove.form.invalid.unk.title'),
        text: t('i.remove.form.invalid.unk.text'),
        showConfirmButton: false,
        timer: 2500,
      });
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      Swal.fire({
        icon: 'error',
        title: t('i.remove.form.invalid.request.title'),
        text: t('i.remove.form.invalid.request.text'),
        showConfirmButton: false,
        timer: 1500,
      });
      console.log('Fetch failed: ', err.toString());
    }
  }
};

export { compressInstallsInVehicle, handleAdRemoving };

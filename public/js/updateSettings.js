const updateData = async data => {
  try {
    const res = axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:5000/api/v1/users/updateMe',
      data
    });

    if (res.data.status === 'success') {
      alert('Data updated successfully');
    }
  } catch (err) {
    console.log(err);
  }
};

document.querySelector('.form-user-data').addEventListener('submit', e => {
  e.preventDefault();

  const form = new FormData();

  form.append('name', document.querySelector('#name').value);
  form.append('email', document.querySelector('#eamil').value);
  form.append('photo', document.querySelector('#photo').files);

  console.log(form);

  updateData(form);
});

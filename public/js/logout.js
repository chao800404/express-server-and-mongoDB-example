const logout = async () => {
  try {
    const res = await axios({
      method: 'get',
      url: 'http://127.0.0.1:5000/api/v1/users/logout'
    });

    if (res.data.status === 'success') location.reload(true);
  } catch (err) {
    console.log(err);
  }
};

document.querySelector('.nav__el--logout').addEventListener('click', e => {
  e.preventDefault();
  logout();
});

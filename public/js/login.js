const login = async ({ email, password }) => {
  try {
    const { data } = await axios({
      method: 'post',
      url: 'http://127.0.0.1:5000/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if (data.status === 'success') {
      alert('Logged in successfully');
      window.location.assign('/');
    }
  } catch (err) {
    alert(err.response.data.message);
    console.log(err.response.data.message);
  }
};

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  login({ email, password });
});

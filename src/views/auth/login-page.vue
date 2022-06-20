<template>
  <div class="flex justify-center items-center bg-[#f9f9f9] h-screen">
    <div
      class="
        flex
        w-auto
        bg-white
        m-[15px]
        p-[25px]
        rounded-[25px]
        shadow-[0_10px_25px_5px_#0000000f]
      "
    >
      <div class="p-[30px]">
        <h1 class="text-center font-bold relative">Log in</h1>
        <ul class="mt-5 p-0 m-0 text-center">
          <li>
            <mdicon name="facebook" size="24" />
          </li>
          <li>
            <mdicon name="linkedin" size="24" />
          </li>
          <li>
            <mdicon name="twitter" size="24" />
          </li>
        </ul>
        <p class="text-center">or use your email</p>
        <form>
          <div class="form-field">
            <label for="email">Email</label>
            <input id="email" type="email" placeholder="Email" />
          </div>
          <div class="form-field">
            <label for="password">Password</label>
            <input id="password" type="password" placeholder="Password" />
          </div>
          <div class="form-options">
            <div class="checkbox-field">
              <input id="rememberMe" type="checkbox" class="checkbox" />
              <label for="rememberMe">Remember Me</label>
            </div>
            <a href="#">Forgot Password?</a>
          </div>
          <div class="form-field">
            <input type="submit" class="btn btn-signin" value="Submit" />
          </div>
        </form>
        <div class="links">
          <a class="float-left" href="#">Privacy Policy</a>
          <a class="float-right" href="#">Terms & Conditions</a>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data: () => ({
    form: {
      email: "",
      password: "",
    },
    errors: {},
    loading: false,
  }),
  methods: {
    async login() {
      this.errors = {};
      let req = { ...this.form };
      this.loading = true;
      try {
        await this.$store.dispatch("auth/logIn", req);
        let nextRoute =
          this.$route.query["redirect"] ||
          this.$store.getters["auth/currentUser"].getHomeRoute();
        this.$router.push(nextRoute);
      } catch (error) {
        if (error.response && error.response.status == 422) {
          this.errors = error.response.data.errors;
        } else {
          this.$store.dispatch("notify/error", {
            message:
              error.response &&
              error.response.data &&
              error.response.data.message
                ? error.response.data.message
                : "Đăng nhập thất bại",
            error,
          });
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
h1 {
  &::after {
    position: absolute;
    content: "";
    height: 5px;
    bottom: -15px;
    margin: 0 auto;
    left: 0;
    right: 0;
    width: 40px;
    background: #7f00ff;
    background: -webkit-linear-gradient(to right, #e100ff, #7f00ff);
    background: linear-gradient(to right, #e100ff, #7f00ff);
    transition: 0.25s;
  }
  &:hover {
    &::after {
      width: 100px;
    }
  }
}
ul > li {
  display: inline-block;
  padding: 10px;
  font-size: 15px;
  width: 47px;
  text-align: center;
  text-decoration: none;
  margin: 5px 2px;
  border-radius: 50%;
  box-shadow: 0px 3px 1px #0000000f;
  border: 1px solid #e2e2e2;
  cursor: pointer;
}
.form-field {
  display: block;
  width: 300px;
  margin: 10px auto;
  label {
    display: block;
    margin-bottom: 10px;
  }
  input[type="email"],
  input[type="password"] {
    width: -webkit-fill-available;
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #e8e8e8;
  }
  input::placeholder {
    color: #e8e8e8;
  }
  input:focus {
    border: 1px solid #ae00ff;
  }
  input[type="checkbox"] {
    display: inline-block;
  }
}

.form-options {
  display: block;
  margin: auto;
  width: 300px;
}
.checkbox-field {
  display: inline-block;
}
.form-options a {
  float: right;
  text-decoration: none;
}
.btn {
  padding: 15px;
  font-size: 1em;
  width: 100%;
  border-radius: 25px;
  border: none;
  margin: 20px 0px;
}
.btn-signin {
  cursor: pointer;
  background: #7f00ff;
  background: linear-gradient(to right, #e100ff, #7f00ff);
  box-shadow: 0px 5px 15px 5px #840fe440;
  color: #fff;
}
</style>
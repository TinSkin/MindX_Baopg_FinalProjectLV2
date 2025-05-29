// Hook để thực hiện tác vụ khi component mount
import { useEffect } from "react";

// Import Formik Yup
import { Formik, Form } from "formik";
import loginSchema from "../../utils/loginSchema";

// Import FontAwesome icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faKey } from "@fortawesome/free-solid-svg-icons";

// Hook dùng để điều hướng giữa các route
import { useNavigate } from "react-router-dom";

// Hàm gọi API để lấy danh sách tài khoản
import { fetchAccounts } from "../../api/accountAPI";

// Import Components
import SocialIcon from "../SocialIcon";
import InputField from "../InputField";
import Notification from "../Notification";

const Login = ({ handleRegisterClick }) => {
  // Khởi tạo hook điều hướng
  const navigate = useNavigate();

  // Nếu đã đăng nhập thì tự động chuyển hướng sang trang hello
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const user = localStorage.getItem("user");
    if (isLoggedIn === "true" && user.role === "user") {
      navigate("/");
    }

    if (isLoggedIn === "true" && user.role === "admin") {
      navigate("/admin/products");
    }
  }, [navigate]);

  return (
    <div className="form-box log-in-form-container absolute bg-white flex items-center h-full">
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={loginSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            // Gọi API lấy danh sách tài khoản
            const accounts = await fetchAccounts();

            // Tìm user khớp với email và password nhập vào
            const user = accounts.find(
              (acc) =>
                acc.email === values.email.trim() &&
                acc.password === values.password.trim()
            );

            if (user) {
              // Nếu tìm thấy: lưu thông tin vào localStorage
              localStorage.setItem("user", JSON.stringify(user));
              localStorage.setItem("isLoggedIn", "true");

              Notification.success("Đăng nhập thành công!", "Chào mừng bạn quay lại.");

              // Điều hướng theo quyền
              if (user.role === "admin") {
                navigate("/admin/products");
              } else {
                navigate("/");
              }
            } else {
              // Nếu không khớp: hiển thị lỗi ở trường email
              Notification.error("Đăng nhập thất bại", "Sai email hoặc mật khẩu.")
              setErrors({ email: "Sai Email hoặc Mật khẩu" });
            }
          } catch (error) {
            // Xử lý lỗi gọi API
            setErrors({ email: "Error Issue Log In" });
            Notification.error("Đăng nhập thất bại", "Không lấy được dữ liệu.");
          } finally {
            // Dừng trạng thái đang xử lý
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form action="#" id="log-in-form" className="w-full">
            <h1 className="text-xl text-dark_blue font-bold md:text-4xl">
              Welcome back
            </h1>
            <p className="text-dark_blue md:text-xl">
              Please enter your details.
            </p>

            {/* Email */}
            <InputField
              label="Email"
              name="email"
              type="email"
              style="relative mb-5 group field"
              icon={
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-camel mr-3"
                />
              }
            />

            {/* Password */}
            <InputField
              label="Password"
              name="password"
              type="password"
              style="relative mb-5 group field"
              icon={
                <FontAwesomeIcon icon={faKey} className="text-camel mr-3" />
              }
            />

            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="remember"
                    aria-describedby="remember"
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="remember" className="text-gray-500">
                    Remember me
                  </label>
                </div>
              </div>
              <a
                href="#"
                className="text-sm font-normal underline text-primary-600 underline-offset-2 dark:text-primary-500"
              >
                Forgot password
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              id="log-in-submit"
              className={`font-bold uppercase log-in-action text-white  focus:ring-4 focus:outline-none rounded-lg text-sm px-5 py-6 text-center flex items-center focus:ring-camel hover:bg-camel my-5 me-2 ${isSubmitting
                ? "bg-green-600 hover:bg-green-700 cursor-not-allowed"
                : "bg-camel hover:bg-logo_color"
                }`}
            >
              {isSubmitting ? "Loading..." : "Log In"}
            </button>

            <p className="text-sm font-semibold text-dark_blue inline">
              Don’t have an account?
              <button
                type="button"
                onClick={handleRegisterClick}
                className="font-medium text-primary-600 dark:text-primary-500 inline underline underline-offset-2"
              >
                Sign up for free
              </button>
            </p>

            {/* SWITCH REGISTER FORM */}
            <button
              onClick={handleRegisterClick}
              type="button"
              id="sign-up-button"
              className="font-semibold uppercase sign-up-button sign-up-action text-dark_blue bg-[#fff] hover:bg-gray-300 focus:ring-4 focus:outline-none focus:bg-gray-300 rounded-lg text-sm px-5 py-3 text-center flex items-center dark:focus:ring-gray-300 dark:hover:bg-gray-300 me-2 mb-2 border-2 border-dark_blue"
            >
              Register Here
            </button>

            <p className="font-semibold text-center">
              or login with social platform
            </p>
            <SocialIcon />
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;

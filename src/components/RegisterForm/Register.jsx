// Hook để thực hiện tác vụ khi component mount
import { useEffect } from "react";

// Import Formik Yup
import { Formik, Form, Field, ErrorMessage } from "formik";
import registerSchema from "../../utils/registerSchema";

// Import FontAwesome icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faUser,
  faLock,
  faUnlock,
} from "@fortawesome/free-solid-svg-icons";

// Hook dùng để điều hướng giữa các route
import { useNavigate } from "react-router-dom";

// Hàm gọi API để lấy danh sách tài khoản
import { fetchAccounts } from "../../api/accountAPI";

// Import Components
import SocialIcon from "../SocialIcon";
import InputField from "../InputField";
import Notification from "../Notification";

const Register = ({ handleLogInClick }) => {
  const navigate = useNavigate();

  // Nếu người dùng đã đăng nhập, điều hướng luôn về trang hello
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
    <div className="form-box absolute bg-white flex items-center sign-up-form-container h-full">
      <Formik
        initialValues={{
          fullName: "",
          phone: "",
          email: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={registerSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          // Tạo user mới từ giá trị nhập vào
          const newUser = {
            fullName: values.fullName.trim(),
            phone: values.phone.trim(),
            email: values.email.trim().toLowerCase(),
            password: values.password.trim(),
            role: "user", // mặc định user
            status: "available"
          };

          try {
            const users = await fetchAccounts();

            const emailExists = users.some(
              (user) => user.email === values.email.trim().toLowerCase()
            );

            if (emailExists) {
              setErrors({ email: "Email đã tồn tại!" });
              Notification.error("Email đã tồn tại", "Vui lòng sử dụng email khác.");
              setSubmitting(false);
              return;
            }

            // Bước 2: Gửi dữ liệu lên API mock để tạo tài khoản
            const response = await fetch(
              "https://mindx-mockup-server.vercel.app/api/resources/accounts_user?apiKey=67fe686cc590d6933cc1248b",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(newUser),
              }
            );

            if (!response.ok) throw new Error("Đăng ký thất bại");

            Notification.success("Đăng ký thành công!", "Đang chuyển hướng...");
            setTimeout(() => handleLogInClick(), 1500); // ← không dùng navigate
          } catch (error) {
            Notification.error("Lỗi không xác định", error.message || "Thử lại sau.");
            alert("Đăng ký thất bại, thử lại sau.");
          } finally {
            setSubmitting(false); // tắt trạng thái loading
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form action="#" id="sign-up-form" className="w-full">
            {/* Username */}
            <InputField
              label="Full Name"
              name="fullName"
              type="text"
              style="relative z-0 w-full mb-3 group field"
              icon={
                <FontAwesomeIcon icon={faUser} className="text-camel mr-3" />
              }
            />

            {/* Phone Number */}
            <InputField
              label="Phone"
              name="phone"
              type="text"
              style="relative z-0 w-full mb-3 group field"
              icon={
                <FontAwesomeIcon icon={faPhone} className="text-camel mr-3" />
              }
            />

            {/* Email */}
            <InputField
              label="Email"
              name="email"
              type="email"
              style="relative z-0 w-full mb-3 group field"
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
              style="relative z-0 w-full mb-3 group field"
              icon={
                <FontAwesomeIcon icon={faLock} className="text-camel mr-3" />
              }
            />

            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              style="relative z-0 w-full mb-3 group field"
              icon={
                <FontAwesomeIcon icon={faUnlock} className="text-camel mr-3" />
              }
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`font-semibold uppercase sign-up-action text-white focus:ring-camel hover:bg-camel rounded-lg text-sm px-5 py-6 text-center flex items-center me-2 mb-2 mt-5 ${isSubmitting
                ? "bg-green-600 hover:bg-green-700 cursor-not-allowed"
                : "bg-camel hover:bg-logo_color"
                }`}
            >
              {isSubmitting ? "Registering..." : "Sign Up"}
            </button>

            <p className="text-sm font-semibold text-dark_blue mr-3 inline">
              Already have an account?{" "}
              <button
                type="button"
                className="font-medium text-primary-600 text-dark_blue"
                onClick={handleLogInClick}
              >
                Log in your account
              </button>
            </p>

            {/* SWITCH LOG IN FORM */}
            <button
              onClick={handleLogInClick}
              type="button"
              id="log-in-button"
              className="font-semibold uppercase log-in-button sign-up-action text-white bg-dark_blue hover:bg-dark_blue/90 focus:ring-4 focus:outline-none focus:ring-dark_blue/50 rounded-lg text-sm px-5 py-3 text-center flex items-center dark:focus:ring-dark_blue/50 dark:hover:bg-dark_blue/30 me-2 mb-2"
            >
              Log In Here
            </button>
            <p className="text-center font-semibold text-dark_blue">
              or register with social platform
            </p>
            <SocialIcon />
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Register;

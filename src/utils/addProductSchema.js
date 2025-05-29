import * as Yup from "yup";

export const addProductSchema = Yup.object().shape({
  id: Yup.string().trim().required("ID là bắt buộc"),
  name: Yup.string().trim().required("Tên sản phẩm là bắt buộc"),
  image: Yup.string().trim().required("Phải nhập ít nhất 1 URL ảnh"),
  basePrice: Yup.number().required("Giá là bắt buộc").min(1000),
  sizeOptions: Yup.array()
    .of(
      Yup.object().shape({
        size: Yup.string().required(),
        price: Yup.number().typeError("Phải là số").required("Bắt buộc"),
      })
    )
    .min(1, "Chọn ít nhất một size"),
  toppings: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required(),
        extraPrice: Yup.number().required(),
      })
    )
    .min(1, "Vui lòng chọn ít nhất một topping"),
  description: Yup.string().trim().required("Vui lòng nhập mô tả"),
  category: Yup.string()
    .oneOf(["Cà Phê", "Trà", "Frappuccino", "Khác"], "Danh mục không hợp lệ")
    .required("Vui lòng chọn danh mục"),
});

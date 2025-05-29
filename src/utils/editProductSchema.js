import * as Yup from "yup";

// Regex để check URL (đơn giản, không quá nghiêm ngặt)
const urlRegex = /^(http|https):\/\/[^ "]+$/;

export const editProductSchema = Yup.object().shape({
  id: Yup.string().trim().required("ID không được để trống"),

  name: Yup.string().trim().required("Tên sản phẩm không được để trống"),

  description: Yup.string()
    .trim()
    .required("Mô tả sản phẩm không được để trống"),

  category: Yup.string()
    .oneOf(["Cà Phê", "Trà", "Frappuccino", "Khác"], "Danh mục không hợp lệ")
    .required("Vui lòng chọn danh mục"),

  image: Yup.array()
    .of(Yup.string().url("Mỗi URL ảnh phải hợp lệ"))
    .min(1, "Phải có ít nhất một ảnh")
    .required("Ảnh là bắt buộc"),

  basePrice: Yup.number()
    .typeError("Giá phải là số")
    .min(0, "Giá phải lớn hơn hoặc bằng 0")
    .required("Vui lòng nhập giá"),

  sizeOptions: Yup.array()
    .of(
      Yup.object().shape({
        size: Yup.string()
          .oneOf(["S", "M", "L"], "Size không hợp lệ")
          .required("Chọn size"),
        price: Yup.number()
          .typeError("Giá phải là số")
          .min(0, "Giá phải >= 0")
          .required("Vui lòng nhập giá cho size"),
      })
    )
    .min(1, "Vui lòng chọn ít nhất 1 size"),

  toppings: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("Tên topping không được trống"),
      extraPrice: Yup.number().min(0, "Giá topping phải >= 0").notRequired(),
    })
  ),
});

import { TextField as MuiTextField } from "@mui/material";
import { useField } from "formik";

const TextField = (props) => {
  const [field, meta] = useField(props);
  const errorText = meta.error && meta.touched ? meta.error : "";

  return (
    <MuiTextField
      fullWidth
      helperText={errorText}
      error={!!errorText}
      {...field}
      {...props}
    />
  );
};

export default TextField;

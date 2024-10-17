import { Button } from "@mui/material";
import { Upload as UploadIcon } from "@mui/icons-material";

const UploadImageButton = ({ inputId, onChange, disabled }) => {
  const id = "upload-button-" + inputId;

  const handleChange = (e) => {
    if (e.target.files) {
      onChange?.(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <label htmlFor={id}>
      <input
        style={{ display: "none" }}
        id={id}
        type="file"
        accept="image/*"
        disabled={disabled}
        onChange={handleChange}
      />
      <Button
        disabled={disabled}
        variant="contained"
        startIcon={<UploadIcon />}
        component="span"
      >
        Upload Image
      </Button>
    </label>
  );
};

export default UploadImageButton;

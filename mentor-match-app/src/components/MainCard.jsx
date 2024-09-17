import { Container, Card, Typography, Stack, Box } from "@mui/material";
import logo from "../assets/logo.png";

const MainCard = ({ children, title, titleSize, props }) => {
  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...props,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          justifyContent: "center",
          alignItems: "center",
          width: 1,
          height: 1,
        }}
      >
        <Card sx={{ width: { xl: "50%", md: "60%", sm: "80%" }, p: 3 }}>
          <Stack
            mb={1}
            spacing={0.5}
            sx={{ alignItems: "center", width: "100%" }}
          >
            <Box
              component="img"
              src={logo}
              alt="logo"
              sx={{ height: "80px", width: "80px" }}
            />
            <Typography variant={titleSize}>{title}</Typography>
          </Stack>
          {children}
        </Card>
      </Stack>
    </Container>
  );
};

export default MainCard;

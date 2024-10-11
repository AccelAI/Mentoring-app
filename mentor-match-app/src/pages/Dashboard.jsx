import { Container, Box, Button } from "@mui/material";
import { signOut } from "../api/auth";

const Dashboard = () => {
  return (
    <Container>
      <Button variant="contained" onClick={signOut}>
        Log out
      </Button>
    </Container>
  );
};

export default Dashboard;

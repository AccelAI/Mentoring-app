import { Container, Box, Stack, Typography } from "@mui/material";
import MainCard from "../components/MainCard";

const GetStarted = () => {
  return (
    <MainCard
      title="Hi, Welcome to Latinx In AI (LXAI)!"
      titleSize={"h4"}
      props={{ py: 3 }}
    >
      <Typography variant="body1">getting started</Typography>
    </MainCard>
  );
};

export default GetStarted;

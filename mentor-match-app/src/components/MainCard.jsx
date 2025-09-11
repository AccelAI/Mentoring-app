import { Container, Card, Typography, Stack, Box } from '@mui/material'
import logo from '../assets/logo.png'

/* Card used for Login, Sign Up and Get Started Pages */
const MainCard = ({
  children,
  title,
  titleSize,
  fontWeight,
  props,
  enableContainer
}) => {
  const content = (
    <Card sx={{ width: { xl: '50%', md: '60%', sm: '80%' }, p: 3 }}>
      <Stack mb={1} spacing={0.5} sx={{ alignItems: 'center', width: '100%' }}>
        <Box
          component="img"
          src={logo}
          alt="logo"
          sx={{ height: '80px', width: '80px' }}
        />
        <Typography variant={titleSize} fontWeight={fontWeight}>
          {title}
        </Typography>
      </Stack>
      {children}
    </Card>
  )

  return enableContainer ? (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...props
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          width: 1,
          height: 1
        }}
      >
        {content}
      </Stack>
    </Container>
  ) : (
    content
  )
}

export default MainCard

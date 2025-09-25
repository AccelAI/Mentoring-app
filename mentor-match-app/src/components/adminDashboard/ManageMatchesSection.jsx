import { useState } from 'react'
import {
  Stack,
  Typography,
  Card,
  Grid2 as Grid,
  IconButton
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import MatchGrid from './MatchGrid'
import CreateNewMatchDialog from '../dialogs/CreateNewMatchDialog'

const ManageMatchesSection = ({ mentorshipPairs, fetchPairs }) => {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <Stack spacing={2} width="100%" p={3}>
      <Typography variant="h6" fontWeight={'light'}>
        Number of Matches: {mentorshipPairs.length}
      </Typography>
      <Grid container spacing={1}>
        <Grid size={1.7}>
          <Card
            sx={{
              height: '100%',
              transition: 'box-shadow 0.3s',
              '&:hover': {
                boxShadow: 2
              }
            }}
            variant="outlined"
          >
            <Stack
              height={'100%'}
              justifyContent={'center'}
              alignItems="center"
              spacing={1}
              p={2}
            >
              <IconButton
                sx={{ alignSelf: 'center' }}
                onClick={() => setDialogOpen(true)}
              >
                <AddIcon fontSize="large" color="primary" />
              </IconButton>
              <Typography variant="body2" textAlign={'center'}>
                Create New Match
              </Typography>
            </Stack>
          </Card>
        </Grid>
        {mentorshipPairs.map((pair, idx) => (
          <MatchGrid
            key={`match-${pair.id ?? idx}`}
            menteeId={pair.menteeId}
            mentorId={pair.mentorId}
            gridSize={1.7}
            fetchPairs={fetchPairs}
          />
        ))}
      </Grid>
      <CreateNewMatchDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fetchPairs={fetchPairs}
      />
    </Stack>
  )
}

export default ManageMatchesSection

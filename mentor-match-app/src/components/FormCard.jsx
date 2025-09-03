import {
  Container,
  Card,
  Typography,
  Stack,
  Box,
  Button,
  IconButton
} from '@mui/material'
import logo from '../assets/logo.png'
import { useState } from 'react'
import { ChevronLeft } from '@mui/icons-material'

/* Card used for the forms */
const FormCard = ({ children, title, type, props, topRef }) => {
  const [showInfo, setShowInfo] = useState(true)

  const handleGetStartedButton = () => {
    topRef?.current?.scrollTo({ top: 0, behavior: 'smooth' })
    setShowInfo(false)
  }

  return (
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
        <Card
          ref={topRef}
          sx={{ width: '90%', p: 3, height: '95%', overflow: 'auto' }}
        >
          <Stack
            mb={1}
            spacing={0.5}
            sx={{ alignItems: 'center', width: '100%' }}
          >
            {!showInfo && (
              <IconButton
                onClick={() => setShowInfo(true)}
                sx={{ alignSelf: 'flex-start' }}
              >
                <ChevronLeft />
              </IconButton>
            )}
            <Box
              component="img"
              src={logo}
              alt="logo"
              sx={{ height: '80px', width: '80px' }}
            />
            <Typography alignSelf={'flex-start'} variant={'h5'} sx={{ pb: 2 }}>
              {title}
            </Typography>
          </Stack>
          {showInfo ? (
            <Box>
              <Stack spacing={2}>
                <Typography variant="h6">Who Should Apply?</Typography>
                {(type === 'mentee' || type === 'both') && (
                  <Typography>
                    If you are a LatinX identifying early career professional or
                    student that is currently (or planning) working on AI
                    research and have an interest in being mentored by senior
                    academics or industry professionals to improve your career
                    during a three-month mentoring program that debuts at LXAI
                    workshops co-located with prestigious AI and ML conferences.
                  </Typography>
                )}
                {(type === 'mentor' || type === 'both') && (
                  <Typography>
                    If you are a LatinX professional or Ally currently working
                    in Artificial Intelligence and would like to share your
                    experience by acting as a mentor during a three-month
                    mentoring program that concludes at LXAI workshops
                    co-located with prestigious AI and ML conferences.
                  </Typography>
                )}

                <Typography variant="h6">Requirements:</Typography>
                {(type === 'mentee' || type === 'both') && (
                  <>
                    <Typography>
                      Mentees may live and work anywhere in the world. However,
                      they would have to identify as LatinX and be doing (or
                      planning to) work in AI (Academia, Industry,
                      Entrepreneurship, and so on) to be considered.
                    </Typography>
                    <Typography>
                      Applicants must provide a single page Commitment &
                      Motivation Statement. The statement can be written in
                      English, Portuguese, or Spanish. Make sure to have it
                      ready before completing this form.
                    </Typography>
                  </>
                )}
                {(type === 'mentor' || type === 'both') && (
                  <>
                    <Typography>
                      Mentors may live and work anywhere in the world. They may
                      identify as LatinX or allies and be doing work in AI
                      (Academia, Industry, Entrepreneurship, and so on) to be
                      considered.
                    </Typography>
                    <Typography>
                      Mentorship may occur in English, Portuguese, or Spanish
                      depending on the mentor and mentee’s fluency and language
                      preferences.
                    </Typography>
                  </>
                )}

                <Typography variant="h6">Expectations:</Typography>
                <Typography>
                  The LatinX in AI Mentoring Program requires mentors and
                  mentees to meet once a month leading up to and including our
                  colocated workshops.{' '}
                </Typography>
                <Typography>
                  We will ask mentors and mentees to provide feedback about
                  their experience which will be shared during a Mentoring Hour
                  at the official event.{' '}
                </Typography>
                <Typography>
                  {' '}
                  Following the completion of this program, you'll be asked to
                  complete a quick survey about your experience and
                  opportunities for the program's improvement.
                </Typography>
                {(type === 'mentor' || type === 'both') && (
                  <Typography>
                    Mentors who complete the program and survey are eligible to
                    receive a token of appreciation on behalf of LatinX in AI.
                  </Typography>
                )}
                <Typography variant="h6">Deadlines:</Typography>
                <Typography>
                  We are accepting rolling applications for mentees and mentors.
                  If you’d like your mentorship relationship to correspond with
                  a specific conference workshop, see those specific workshop
                  pages for their deadlines to participate. Make sure to
                  indicate which conference you’d like your mentorship
                  relationship to correspond with in the application below.
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleGetStartedButton}
                  sx={{ width: '150px', alignSelf: 'flex-end' }}
                >
                  Get Started
                </Button>
              </Stack>
            </Box>
          ) : (
            children
          )}
        </Card>
      </Stack>
    </Container>
  )
}

export default FormCard

import {
  Card,
  Box,
  Stack,
  Typography,
  CircularProgress,
  Tooltip,
  IconButton
} from '@mui/material'
import { AssignmentOutlined as SurveyIcon } from '@mui/icons-material'
import { useUser } from '../../hooks/useUser'
import {
  getSurveysByStatusAndUserRole,
  getSurveyResponses
} from '../../api/surveys'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'

const ActiveSurveys = ({ loadingSurveys, activeSurveys }) => {
  const navigate = useNavigate()
  const columns = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        Header: <b>Title</b>
      },
      {
        id: 'publishedAt',
        header: 'Date Published',
        Header: <b>Date Published</b>,
        accessorFn: (row) => {
          const ts = row?.publishedAt
          if (!ts) return null
          return ts.toDate ? ts.toDate() : new Date(ts)
        },
        Cell: ({ cell }) => {
          const v = cell.getValue()
          return v ? new Date(v).toLocaleString() : '—'
        },
        sortingFn: 'datetime'
      },
      {
        accessorKey: 'answerStatus',
        header: 'Status',
        Header: <b>Status</b>
      }
    ],
    []
  )

  const table = useMaterialReactTable({
    columns,
    data: activeSurveys,
    muiTablePaperProps: {
      elevation: 0 //change the mui box shadow
    },
    enableFullScreenToggle: false,
    enableColumnActions: false,
    enableRowActions: true,
    state: { isLoading: loadingSurveys },
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => {
      const isAnswered = row.original.answerStatus === 'Answered'
      return (
        <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '2px' }}>
          <Tooltip title={isAnswered ? 'Already answered' : 'Answer Survey'}>
            <span>
              <IconButton
                disabled={isAnswered}
                onClick={() =>
                  !isAnswered && navigate('/survey/' + row.original.id)
                }
              >
                <SurveyIcon
                  color={isAnswered ? 'action.disabled' : 'secondary'}
                />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )
    },
    renderEmptyRowsFallback: () => (
      <Typography p={3} fontStyle={'italic'} textAlign={'center'}>
        No active surveys at the moment
      </Typography>
    )
  })

  return (
    <Card
      sx={{
        width: loadingSurveys ? '-webkit-fill-available' : '100%',
        maxHeight: '75vh',
        minWidth: { lg: '835px' },
        overflowY: 'auto',
        padding: 1
      }}
    >
      <Box px={3} py={2}>
        <Box flexGrow={1}>
          <Stack spacing={2} sx={{ pb: 2 }}>
            <Typography variant="h6" fontWeight={'light'}>
              Active Surveys
            </Typography>

            <Stack spacing={1}>
              <MaterialReactTable table={table} loading={loadingSurveys} />
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Card>
  )
}

export default ActiveSurveys

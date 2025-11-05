import { useMemo, useState, useEffect } from 'react'
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ToggleFullScreenButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleGlobalFilterButton,
  MRT_ToggleDensePaddingButton
} from 'material-react-table'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Link as LinkIcon,
  Preview as PreviewIcon
} from '@mui/icons-material'
import { createEmptySurvey, deleteSurvey } from '../../api/surveys'
import { useUser } from '../../hooks/useUser'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'

const ManageSurveysSection = ({ surveyData, fetchSurveys, loading }) => {
  const { user } = useUser()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const columns = useMemo(
    () => [
      {
        accessorKey: 'title', //simple recommended way to define a column
        header: 'Title',
        Header: <b>Title</b> //optional custom markup
      },
      {
        id: 'createdAt',
        header: 'Creation Date',
        Header: <b>Creation Date</b>,
        accessorFn: (row) => {
          const ts = row?.createdAt
          // Firestore Timestamp -> Date; allow ISO string/number too
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
        accessorKey: 'author', //simple recommended way to define a column
        header: 'Author',
        Header: <b>Author</b>,
        accessorFn: (row) => row?.author?.name
      },
      {
        accessorKey: 'responses', //simple recommended way to define a column
        header: 'Responses',
        Header: <b>Responses</b> //optional custom markup
      }
    ],
    []
  )

  const table = useMaterialReactTable({
    data: surveyData,
    columns,
    initialState: { density: 'spacious' },
    muiTablePaperProps: {
      elevation: 0 //change the mui box shadow
    },
    enableFullScreenToggle: false,
    enableColumnActions: false,
    enableRowActions: true,
    positionActionsColumn: 'last',
    state: { isLoading: loading },
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '2px' }}>
        <Tooltip title="Edit Survey">
          <IconButton
            onClick={() => navigate('/survey/edit/' + row.original.id)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Copy Link">
          <IconButton
            onClick={() => {
              const url = `${window.location.origin}/survey/${row.original.id}`
              navigator.clipboard.writeText(url)
              enqueueSnackbar('Survey link copied to clipboard', {
                variant: 'info'
              })
            }}
          >
            <LinkIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="See Live Survey">
          <IconButton
            onClick={() =>
              window.open(
                `${window.location.origin}/survey/${row.original.id}`,
                '_blank',
                'noopener,noreferrer'
              )
            }
          >
            <PreviewIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Survey">
          <IconButton
            onClick={async () => {
              const res = await deleteSurvey(row.original.id)
              if (res.ok) {
                enqueueSnackbar('Survey deleted successfully', {
                  variant: 'success'
                })
                fetchSurveys()
              } else {
                enqueueSnackbar('Error deleting survey: ' + res.error, {
                  variant: 'error'
                })
              }
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderToolbarInternalActions: ({ table }) => (
      <>
        <Tooltip title="Create New Survey">
          <IconButton
            onClick={async () => {
              const newSurveyId = await createEmptySurvey(user.uid)
              //console.log('New survey created with ID:', newSurveyId)
              navigate('/survey/edit/' + newSurveyId)
            }}
          >
            <AddIcon color="primary" />
          </IconButton>
        </Tooltip>
        <MRT_ToggleGlobalFilterButton table={table} />
        <MRT_ToggleFiltersButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </>
    ),
    renderEmptyRowsFallback: () => (
      <Typography p={3} fontStyle={'italic'} textAlign={'center'}>
        No surveys created yet
      </Typography>
    )
  })

  return <MaterialReactTable table={table} loading={loading} />
}

export default ManageSurveysSection

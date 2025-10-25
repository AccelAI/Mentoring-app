import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ToggleFullScreenButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleGlobalFilterButton,
  MRT_ToggleDensePaddingButton
} from 'material-react-table'
import { useMemo } from 'react'
import { mkConfig, generateCsv, download } from 'export-to-csv'
import { Box, IconButton, Tooltip } from '@mui/material'
import { Download as DownloadIcon } from '@mui/icons-material'

const AnswersTable = ({ data, questions, surveyName }) => {
  const columns = useMemo(() => {
    const qs = questions ?? []
    return qs.map((q) => ({
      accessorKey: q.id, // stable key
      header: q.title || q.id // user-friendly header
    }))
  }, [questions])

  const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    columnHeaders: columns.map((col) => ({
      key: col.accessorKey,
      displayLabel: col.header
    })),
    fileName: surveyName || 'survey_answers',
    title: surveyName || 'Survey Answers'
  })

  const formattedData = useMemo(() => {
    const responses = data?.responses ?? []
    return responses.map((r) => {
      const answers = r?.answers ?? {}
      const row = {}
      Object.entries(answers).forEach(([key, value]) => {
        // Convert arrays (e.g., checklist) to comma-separated strings
        if (Array.isArray(value)) {
          row[key] = value.join(', ')
        } else {
          row[key] = value
        }
      })
      return row
    })
  }, [data])

  console.log('Formatted data for AnswersTable:', formattedData)

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(formattedData)
    download(csvConfig)(csv)
  }

  const table = useMaterialReactTable({
    data: formattedData,
    columns,
    initialState: { density: 'spacious' },
    muiTablePaperProps: {
      elevation: 0 //change the mui box shadow
    },
    enableColumnActions: false,
    renderToolbarInternalActions: ({ table }) => (
      <>
        <Tooltip title="Export table as CSV">
          <IconButton onClick={handleExportData}>
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        <MRT_ToggleGlobalFilterButton table={table} />
        <MRT_ToggleFiltersButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </>
    )
  })

  return <MaterialReactTable table={table} />
}

export default AnswersTable

import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import MUITable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { TableCellProps } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';

type TablePropsDataType = string | number | null | undefined;

interface TableRow {
  [key: string]: TablePropsDataType;
}

interface TableProps {
  ariaLabel: string;
  columns: {
    name: string;
    dataKey: string;
    dataFormatter?: (value: TablePropsDataType, row: TableRow) => string | JSX.Element;
    isHeader?: boolean;
    headerDataKey?: TablePropsDataType;
    className?: string;
    sortable?: boolean;
    sortDirection?: 'asc' | 'desc';
    onSort?: () => void;
    stickyRight?: boolean;
  }[];
  rows: TableRow[];
}

export default function Table({ ariaLabel, columns, rows }: Readonly<TableProps>) {
  const headerColumns = columns.filter((column) => column.isHeader && column.headerDataKey);

  if (headerColumns.length !== 1) {
    return (
      <Alert severity="error">
        Header columns have not been configured correctly for this table.
      </Alert>
    );
  }

  const headerColumn = headerColumns[0];

  return (
    <TableContainer component={Paper} aria-label={ariaLabel}>
      <MUITable aria-label="Table of Songs">
        <TableHead>
          <TableRow>
            {columns.map(({ name, sortable, sortDirection, onSort, stickyRight }) => (
              <TableCell
                key={name}
                sx={stickyRight ? { position: 'sticky', right: 0, backgroundColor: 'background.paper', zIndex: 2 } : undefined}
              >
                {sortable ? (
                  <TableSortLabel
                    active={sortDirection !== undefined}
                    direction={sortDirection ?? 'asc'}
                    onClick={onSort}
                  >
                    {name}
                  </TableSortLabel>
                ) : (
                  name
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            return (
              <TableRow key={row[headerColumn.headerDataKey ?? '']}>
                {columns.map(
                  ({ name, dataKey, dataFormatter, isHeader, headerDataKey, className, stickyRight }) => {
                    let component: TableCellProps['component'] = 'td';
                    let scope: TableCellProps['scope'];
                    let value: TablePropsDataType | JSX.Element = row[dataKey];

                    if (dataFormatter) {
                      value = dataFormatter(value, row);
                    }

                    if (isHeader && headerDataKey) {
                      component = 'th';
                      scope = 'row';
                    }

                    return (
                      <TableCell
                        component={component}
                        scope={scope}
                        key={name}
                        className={className}
                        sx={stickyRight ? { position: 'sticky', right: 0, backgroundColor: 'background.paper', zIndex: 1 } : undefined}
                      >
                        {value}
                      </TableCell>
                    );
                  }
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </MUITable>
    </TableContainer>
  );
}

export type { TableProps, TablePropsDataType, TableRow };

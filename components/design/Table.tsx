import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import MUITable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { TableCellProps } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

type TablePropsDataType = string | number | null | undefined;

interface TableProps {
  ariaLabel: string;
  columns: {
    name: string;
    dataKey: string;
    dataFormatter?: (value: TablePropsDataType) => string | JSX.Element;
    isHeader?: boolean;
    headerDataKey?: TablePropsDataType;
    className?: string;
  }[];
  rows: { [key: string]: TablePropsDataType }[];
}

export default function Table({
  ariaLabel,
  columns,
  rows,
}: Readonly<TableProps>) {
  const headerColumns = columns.filter(
    (column) => column.isHeader && column.headerDataKey
  );

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
            {columns.map(({ name }) => (
              <TableCell key={name}>{name}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            return (
              <TableRow key={row[headerColumn.headerDataKey || '']}>
                {columns.map(
                  ({
                    name,
                    dataKey,
                    dataFormatter,
                    isHeader,
                    headerDataKey,
                    className,
                  }) => {
                    let component: TableCellProps['component'] = 'td';
                    let scope: TableCellProps['scope'];
                    let value: TablePropsDataType | JSX.Element = row[dataKey];

                    if (dataFormatter) {
                      value = dataFormatter(value);
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

export type { TableProps, TablePropsDataType };

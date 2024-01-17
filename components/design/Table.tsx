import Paper from '@mui/material/Paper';
import MUITable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { TableCellProps } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

type TablePropsDataType = string | number | null | undefined;

interface TableProps {
  columns: {
    name: string;
    dataKey: string;
    dataFormatter?: (value: TablePropsDataType) => string;
    isHeader?: boolean;
    headerDataKey?: TablePropsDataType;
    className?: string;
  }[];
  rows: { [key: string]: TablePropsDataType }[];
}

export default function Table({ columns, rows }: TableProps) {
  return (
    <TableContainer component={Paper}>
      <MUITable aria-label="Table of Songs">
        <TableHead>
          <TableRow>
            {columns.map(({ name }) => (
              <TableCell key={name}>{name}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
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
                  let value = row[dataKey];

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
          ))}
        </TableBody>
      </MUITable>
    </TableContainer>
  );
}

export type { TableProps, TablePropsDataType };

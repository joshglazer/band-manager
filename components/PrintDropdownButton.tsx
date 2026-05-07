'use client';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PrintIcon from '@mui/icons-material/Print';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import { useRef, useState } from 'react';

interface PrintOption {
  label: string;
  url: string;
}

interface PrintDropdownButtonProps {
  options: PrintOption[];
}

export default function PrintDropdownButton({ options }: Readonly<PrintDropdownButtonProps>) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <ButtonGroup variant="outlined" ref={anchorRef}>
        <Button startIcon={<PrintIcon />} onClick={() => setOpen((prev) => !prev)}>
          Print
        </Button>
        <Button size="small" sx={{ px: 0.5 }} onClick={() => setOpen((prev) => !prev)}>
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper open={open} anchorEl={anchorRef.current} placement="bottom-end" transition disablePortal style={{ zIndex: 1300 }}>
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper elevation={3}>
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <MenuList dense>
                  {options.map((option) => (
                    <MenuItem
                      key={option.label}
                      onClick={() => {
                        window.open(option.url, '_blank');
                        setOpen(false);
                      }}
                    >
                      <ListItemIcon>
                        <PrintIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>{option.label}</ListItemText>
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

export const SELECT_STYLE ={
  control: styles => ({ ...styles, boxShadow: "none", alignItems: "normal", border: "1px solid #bfbfbf", borderRadius: "3px", fontSize: "small", fontFamily: "72" }),
  container: styles => ({ ...styles, fontSize: "smaller", fontFamily: "72", width: "250px" }),
  indicatorSeparator: styles => ({ ...styles, display: "none" }),
  indicatorContainer: styles => ({ ...styles, padding: "5px" }),
  dropdownIndicator: styles => ({ ...styles, color: "#346187 !important"  }),
  menu: styles => ({...styles, zIndex: "1200", position: "static"}),
  option: (styles, { isFocused, isSelected, isActive }) => ({
      ...styles,
      fontFamily: "72",
      backgroundColor: isSelected ? '#EFF4F9' : isFocused ? 'lightgrey' : isActive ? '#346187' : undefined,
      color: 'black',
      ':active': {
        ...styles[':active'],
        backgroundColor: '#346187',
        color: 'white'
      }
    })
}
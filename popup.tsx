import ratings from '@mtucourses/rate-my-professors';
import SettingsIcon from '@mui/icons-material/Settings';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { IconButton, Tooltip, Typography } from '@mui/material';
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import logoImage from "data-base64:~assets/icon.png";
import useDebounce from "hooks/useDebounce";
import { BuyMeACoffee } from '~buy-me-a-coffe';
import "popup.css";
import React from 'react';
import { useEffect, useState } from "react";
interface School {
  city: string;
  id: string;
  name: string;
  state: string;
}

const autocompleteService = { current: null };

interface MainTextMatchedSubstrings {
  offset: number;
  length: number;
}
interface StructuredFormatting {
  main_text: string;
  secondary_text: string;
  main_text_matched_substrings?: readonly MainTextMatchedSubstrings[];
}
interface PlaceType {
  description: string;
  structured_formatting: StructuredFormatting;
}

const syncSchool = (school) => {
  chrome.storage.sync.set({ school }).then(() => {
    console.log("Value is set", school);
  });
}

function IndexPopup() {
  // const debouncedSearch = useDeBounce(search, 500);
  const [schoolOptions, setSchoolOptions] = useState([{
    "city": "Boston",
    "id": "U2Nob29sLTM5ODA=",
    "name": "University of Massachusetts - Boston",
    "state": "MA"
  },
  {
    "city": "Whitewater",
    "id": "U2Nob29sLTE4Nzc4",
    "name": "University of Wisconsin of Whitewater",
    "state": "WI"
  },
  {
    "city": "SF",
    "id": "U2Nob29sLTM=",
    "name": "Academy of Art University",
    "state": "CA"
  },
  {
    "city": "California",
    "id": "U2Nob29sLTE2OQ==",
    "name": "California University of Pennsylvania",
    "state": "PA"
  },
  {
    "city": "Warrensburg",
    "id": "U2Nob29sLTIwMQ==",
    "name": "University of Central Missouri",
    "state": "MO"
  },
  {
    "city": "Williamsburg",
    "id": "U2Nob29sLTMwNQ==",
    "name": "University of the Cumberlands",
    "state": "KY"
  },
  {
    "city": "Indiana",
    "id": "U2Nob29sLTQ0Mw==",
    "name": "Indiana University of Pennsylvania",
    "state": "PA"
  },
  {
    "city": "Jamestown",
    "id": "U2Nob29sLTQ1OA==",
    "name": "University of Jamestown",
    "state": "ND"
  },
  {
    "city": "Lynchburg",
    "id": "U2Nob29sLTU0Ng==",
    "name": "University of Lynchburg",
    "state": "VA"
  },
  {
    "city": "Fredericksburg",
    "id": "U2Nob29sLTU2OA==",
    "name": "University of Mary Washington",
    "state": "VA"
  },
  {
    "city": "Mt Olive",
    "id": "U2Nob29sLTY0NQ==",
    "name": "University of Mount Olive",
    "state": "NC"
  }
]);
  const [value, setValue] = useState<School | null>(schoolOptions[0]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false)
  
  const debouncedSearch = useDebounce(inputValue, 500);

  useEffect(() => {

    async function fetchSchools() {
      setLoading(true)
      const res = await ratings.searchSchool(debouncedSearch);
      setSchoolOptions(res);
      setLoading(false)
    }

    if (debouncedSearch) fetchSchools();

  }, [debouncedSearch])

  useEffect(() => {
    console.log(value)
  }, [value])
  

  return (
    <div style={{backgroundColor: "#f4f4f4", borderRadius: '8px'}}>
      <section className="title-section" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', paddingLeft: '16px', paddingRight: '16px'}}>
          <div className="logo-title" style={{display: 'flex', alignItems: 'center', width: 'fit'}}>
            <img src={logoImage} alt="WiserPlus logo" style={{width: '24px', height: '24px', marginRight: '2px'}}/>
            <Typography variant='h5' ><span style={{fontWeight: "bold"}}>Wiser</span>Plus</Typography>
          </div>
          <div className="header-info">
            <BuyMeACoffee/>
          </div>
      </section>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 300,
          padding: 16
        }}>
        <Typography variant='body2' style={{backgroundColor: "white", borderRadius: "12px"}} p={1}>
          This extension only supports UMass schools as of now. I'm working on it to make it possible for other schools (as long as they use Wiser).</Typography>
        <Autocomplete
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
            syncSchool(newValue);
          }}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          options={schoolOptions}
          getOptionLabel={(option) => option.name || ''}
          sx={{ marginY: 2 }}
          isOptionEqualToValue={(option, value) => option.name === value.name}
          noOptionsText={loading ? 'Loading...' : 'No schools found'}
          renderInput={(params) => <TextField {...params} label="School" />}
          style={{backgroundColor: "white"}}
        />

          <div style={{backgroundColor: "white", padding: "8px", borderRadius: "12px"}}>
            <Typography variant='h6'>School Information</Typography>
            <Typography variant='caption' display="block">{value?.name || ''}</Typography>
            <Typography variant='caption' display="block">City: {value?.city || ''}</Typography>
            <Typography variant='caption' display="block">State: {value?.state || ''}</Typography>
          </div>

        <Typography variant='body2' my={2}>Made by <a target="_blank" href="https://www.minh.boston/">Minh Nguyen</a> and <a target="_blank" href="https://www.lorenzoorio.com/">Lorenzo Orio</a> with ❤️
        </Typography>
      </div>
    </div>
  )
}

export default IndexPopup

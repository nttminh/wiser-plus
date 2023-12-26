import ratings from '@mtucourses/rate-my-professors';
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import useDebounce from "hooks/useDebounce";
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 300,
        padding: 16
      }}>
      <h1>Wiser Plus</h1>
      <p>
        This extension only supports UMass Boston as of now. I'm working on it to make it possible for other schools (as long as they use Wiser).</p>
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
          renderInput={(params) => <TextField {...params} label="School" />} />

        <div>
          <h3>School Information</h3>
          {/* <p>City: {school?. || ''}</p>
          <p>State: {school?.state || ''}</p> */}
        </div>

      <span>Made by <a target="_blank" href="https://www.minh.boston/">Minh Nguyen</a> with ❤️
      </span>
    </div>
  )
}

export default IndexPopup

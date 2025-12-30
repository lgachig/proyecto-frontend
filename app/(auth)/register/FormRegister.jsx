import { 
  styled, 
  InputBase, 
  InputLabel, 
  FormControl, 
  Typography,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
} from '@mui/material';

const CustomInput = styled(InputBase)(({ theme }) => ({
  '& .MuiInputBase-input': {
    borderRadius: 12,
    position: 'relative',
    backgroundColor: '#FFFFFF',
    border: 'none',
    fontSize: '1vw',
    width: '100%',
    padding: '1.2vw 1.5vw',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
    transition: theme.transitions.create(['box-shadow', 'transform']),
    '&:focus': {
      boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#FFFFFF',
    },
  },
}));

const FormField = ({ label, name, type = "text", placeholder, form, validators }) => (
  <form.Field name={name} validators={validators}>
    {(field) => (
      <FormControl variant="standard" fullWidth sx={{ mb: '1.5vw' }}>
        <InputLabel 
          shrink 
          htmlFor={name}
          sx={{ 
            fontSize: '1.2vw', 
            color: '#333', 
            fontWeight: 600,
            position: 'relative', 
            transform: 'none',     
            mb: '0.5vw',           
          }}
        >
          {label}
        </InputLabel>
        <CustomInput
          id={name}
          type={type}
          placeholder={placeholder}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
        />
        {field.state.meta.errors.length > 0 && (
          <Typography sx={{ color: 'red', fontSize: '0.8vw', mt: 1 }}>
            {field.state.meta.errors.join(', ')}
          </Typography>
        )}
      </FormControl>
    )}
  </form.Field>
);

export default function FormRegister ({ form, isLoading = false, roleId, setRoleId }) {
  return(<>
      <div className="bg-[#F3EFE8] rounded-[28px] p-[45px] shadow-sm w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex flex-col gap-2"
      >
        <FormField 
          label="Full Name" 
          name="fullName" 
          placeholder="John Doe" 
          form={form} 
          validators={{ onChange: ({ value }) => !value ? "Name is required" : undefined }}
        />

        <FormField 
          label="Institutional ID" 
          name="institutionalId" 
          placeholder="UCE-2024-0001" 
          form={form} 
          validators={{ 
            onChange: ({ value }) => !value ? "Institutional ID is required" : undefined 
          }}
        />

        {setRoleId && (
          <FormControl variant="standard" fullWidth sx={{ mb: '1.5vw' }}>
            <InputLabel 
              shrink 
              sx={{ 
                fontSize: '1.2vw', 
                color: '#333', 
                fontWeight: 600,
                position: 'relative', 
                transform: 'none',     
                mb: '0.5vw',           
              }}
            >
              Role
            </InputLabel>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              style={{
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                border: 'none',
                fontSize: '1vw',
                width: '100%',
                padding: '1.2vw 1.5vw',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
              }}
            >
              <option value="r001">Estudiante (Student)</option>
              <option value="r002">Docente (Faculty)</option>
              <option value="r003">Personal (Staff)</option>
            </select>
          </FormControl>
        )}

        <FormField 
          label="Gmail" 
          name="email" 
          type="email"
          placeholder="example@gmail.com" 
          form={form}
          validators={{ 
            onChange: ({ value }) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Invalid email" : undefined 
          }}
        />

        <FormField 
          label="Password" 
          name="password" 
          type="password"
          placeholder="••••••••" 
          form={form}
          validators={{ 
            onChange: ({ value }) => value.length < 8 ? "Min 8 characters" : undefined 
          }}
        />

        <form.Field name="terms" validators={{ onChange: ({ value }) => !value ? "Must accept" : undefined }}>
          {(field) => (
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={field.state.value} 
                    onChange={(e) => field.handleChange(e.target.checked)}
                    sx={{ '& .MuiSvgIcon-root': { fontSize: '1.5vw' } }}
                  />
                }
                label={<span className="text-[1vw]">I accept the terms and conditions</span>}
              />
            </Box>
          )}
        </form.Field>

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disableElevation
          disabled={isLoading}
          sx={{
            backgroundColor: '#2F66F2',
            borderRadius: '12px',
            padding: '1.2vw',
            fontSize: '1.2vw',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#1e4fd1',
              boxShadow: '0px 8px 20px rgba(47, 102, 242, 0.3)',
            }
          }}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </div>
      </>)
}
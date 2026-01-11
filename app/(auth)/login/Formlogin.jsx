import { 
  styled, 
  InputBase, 
  InputLabel, 
  FormControl, 
  Button, 
  Typography 
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
    transition: theme.transitions.create([
      'box-shadow',
      'transform',
    ]),
    '&:focus': {
      boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#FFFFFF',
    },
  },
}));

const FormField = ({ label, name, type = "text", placeholder, form, validators, autoComplete }) => (
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
          autoComplete={autoComplete}
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

export default function FormLogin({ form }) {
  return (
    <div className="bg-[#F3EFE8] rounded-[28px] p-[45px] shadow-sm w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex flex-col gap-2"
      >
        <FormField 
          label="Gmail" 
          name="email" 
          type="email"
          placeholder="example@gmail.com" 
          autoComplete="username"
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
          autoComplete="current-password"
          form={form}
          validators={{ 
            onChange: ({ value }) => !value ? "Password is required" : undefined 
          }}
        />

        <div className="text-right mb-4">
          <a href="#" className="text-[#F28C28] text-[0.9vw] font-semibold">
            Did you forget your password?
          </a>
        </div>

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disableElevation
          disabled={form.state.isSubmitting}
          sx={{
            backgroundColor: form.state.isSubmitting ? '#ccc' : '#2F66F2',
            borderRadius: '12px',
            padding: '1.2vw',
            fontSize: '1.2vw',
            mt: '1vw',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#1e4fd1',
              boxShadow: '0px 8px 20px rgba(47, 102, 242, 0.3)',
            }
          }}
        >
          {form.state.isSubmitting ? 'Cargando...' : 'Log in'}
        </Button>
      </form>
    </div>
  );
}
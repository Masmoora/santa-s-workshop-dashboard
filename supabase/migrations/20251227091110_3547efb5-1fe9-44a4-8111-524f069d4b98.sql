-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('child', 'elf', 'sanda');

-- Create profiles table to store user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'child',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create addresses table for children
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  house_street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create wishes/wishlist table
CREATE TABLE public.wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  wish_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed')),
  assigned_elf_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create letters table
CREATE TABLE public.letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  letter_content TEXT NOT NULL,
  reply_content TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'replied')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  replied_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = _user_id
$$;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = _user_id AND role = _role
  )
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Sanda can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'sanda'));

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Addresses RLS policies
CREATE POLICY "Users can view own address"
ON public.addresses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Sanda can view all addresses"
ON public.addresses FOR SELECT
USING (public.has_role(auth.uid(), 'sanda'));

CREATE POLICY "Elves can view assigned children addresses"
ON public.addresses FOR SELECT
USING (
  public.has_role(auth.uid(), 'elf') AND
  EXISTS (
    SELECT 1 FROM public.wishes 
    WHERE wishes.child_id = addresses.user_id 
    AND wishes.assigned_elf_id = auth.uid()
  )
);

CREATE POLICY "Children can insert own address"
ON public.addresses FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'child'));

CREATE POLICY "Children can update own address"
ON public.addresses FOR UPDATE
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'child'));

-- Wishes RLS policies
CREATE POLICY "Children can view own wishes"
ON public.wishes FOR SELECT
USING (auth.uid() = child_id);

CREATE POLICY "Sanda can view all wishes"
ON public.wishes FOR SELECT
USING (public.has_role(auth.uid(), 'sanda'));

CREATE POLICY "Elves can view assigned wishes"
ON public.wishes FOR SELECT
USING (public.has_role(auth.uid(), 'elf') AND assigned_elf_id = auth.uid());

CREATE POLICY "Children can insert own wishes"
ON public.wishes FOR INSERT
WITH CHECK (auth.uid() = child_id AND public.has_role(auth.uid(), 'child'));

CREATE POLICY "Sanda can update all wishes"
ON public.wishes FOR UPDATE
USING (public.has_role(auth.uid(), 'sanda'));

CREATE POLICY "Elves can update assigned wishes"
ON public.wishes FOR UPDATE
USING (public.has_role(auth.uid(), 'elf') AND assigned_elf_id = auth.uid());

-- Letters RLS policies
CREATE POLICY "Children can view own letters"
ON public.letters FOR SELECT
USING (auth.uid() = child_id);

CREATE POLICY "Sanda can view all letters"
ON public.letters FOR SELECT
USING (public.has_role(auth.uid(), 'sanda'));

CREATE POLICY "Children can insert own letters"
ON public.letters FOR INSERT
WITH CHECK (auth.uid() = child_id AND public.has_role(auth.uid(), 'child'));

CREATE POLICY "Sanda can update letters (reply)"
ON public.letters FOR UPDATE
USING (public.has_role(auth.uid(), 'sanda'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at
BEFORE UPDATE ON public.addresses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wishes_updated_at
BEFORE UPDATE ON public.wishes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'child')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
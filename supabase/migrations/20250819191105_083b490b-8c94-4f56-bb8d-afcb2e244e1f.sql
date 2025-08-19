-- Additional security measures for newsletter_subscribers table

-- Add explicit policy to deny all public access
CREATE POLICY "Deny public access to newsletter subscribers" 
ON public.newsletter_subscribers 
FOR ALL 
TO anon 
USING (false);

-- Add audit trigger for newsletter subscriber changes
CREATE TRIGGER audit_newsletter_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();

-- Add rate limiting for newsletter operations
CREATE OR REPLACE FUNCTION public.subscribe_to_newsletter(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Check rate limit (5 attempts per 15 minutes per IP)
  IF NOT public.check_rate_limit(
    COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', '127.0.0.1'),
    'newsletter_subscribe',
    5,
    15
  ) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;

  -- Validate email format
  IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Insert or update subscriber
  INSERT INTO public.newsletter_subscribers (email, status, subscribed_at)
  VALUES (lower(trim(p_email)), 'active', now())
  ON CONFLICT (email) 
  DO UPDATE SET 
    status = 'active',
    subscribed_at = now(),
    unsubscribed_at = NULL
  WHERE newsletter_subscribers.status = 'unsubscribed';

  -- Log the subscription attempt
  PERFORM public.log_access_attempt(
    NULL,
    'newsletter_subscribe',
    p_email,
    true
  );

  result := json_build_object(
    'success', true,
    'message', 'Successfully subscribed to newsletter'
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Log failed attempt
    PERFORM public.log_access_attempt(
      NULL,
      'newsletter_subscribe',
      p_email,
      false
    );
    
    RAISE;
END;
$$;

-- Add function to safely unsubscribe
CREATE OR REPLACE FUNCTION public.unsubscribe_from_newsletter(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Update subscriber status
  UPDATE public.newsletter_subscribers 
  SET 
    status = 'unsubscribed',
    unsubscribed_at = now()
  WHERE lower(trim(email)) = lower(trim(p_email))
    AND status = 'active';

  -- Log the unsubscription
  PERFORM public.log_access_attempt(
    NULL,
    'newsletter_unsubscribe',
    p_email,
    true
  );

  result := json_build_object(
    'success', true,
    'message', 'Successfully unsubscribed from newsletter'
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Log failed attempt
    PERFORM public.log_access_attempt(
      NULL,
      'newsletter_unsubscribe',
      p_email,
      false
    );
    
    RAISE;
END;
$$;

document.addEventListener('DOMContentLoaded', () => {
    const contactForms = document.querySelectorAll('.contact-form, .contact-full-form');

    contactForms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');

        // Helper to get error messages based on language
        const getErrorMessage = (type) => {
            const lang = document.documentElement.getAttribute('lang') || 'ar';
            const messages = {
                ar: {
                    required: 'هذا الحقل مطلوب',
                    email: 'يرجى إدخال بريد إلكتروني صحيح',
                    phone: 'يجب أن يبدأ الرقم بـ 07 ويتكون من 11 رقم',
                },
                en: {
                    required: 'This field is required',
                    email: 'Please enter a valid email',
                    phone: 'Phone must start with 07 and be 11 digits',
                }
            };
            return messages[lang][type] || messages[lang].required;
        };

        // Validation logic for a single field
        const validateField = (input) => {
            const value = input.value.trim();
            const group = input.closest('.input-group');
            let isValid = true;
            let errorType = 'required';

            // Reset previous error
            group.classList.remove('invalid');
            const oldError = group.querySelector('.error-msg');
            if (oldError) oldError.remove();

            // Required check
            if (!value) {
                isValid = false;
                errorType = 'required';
            }
            // Email check
            else if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorType = 'email';
                }
            }
            // Phone check
            else if (input.type === 'tel') {
                const phoneDigits = value.replace(/\D/g, '');
                if (!value.startsWith('07') || phoneDigits.length !== 11) {
                    isValid = false;
                    errorType = 'phone';
                }
            }

            if (!isValid) {
                group.classList.add('invalid');
                const errorSpan = document.createElement('span');
                errorSpan.className = 'error-msg';
                errorSpan.textContent = getErrorMessage(errorType);
                group.appendChild(errorSpan);
            }

            return isValid;
        };

        // Add blur listeners for "touch and leave" validation
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                validateField(input);
            });

            // Remove error while typing
            input.addEventListener('input', () => {
                const group = input.closest('.input-group');
                group.classList.remove('invalid');
                const error = group.querySelector('.error-msg');
                if (error) error.remove();
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate all fields before submission
            let formIsValid = true;
            inputs.forEach(input => {
                if (!validateField(input)) {
                    formIsValid = false;
                }
            });

            if (!formIsValid) {
                const firstInvalid = form.querySelector('.input-group.invalid');
                if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            // Find the submit button and store original text
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;

            // Get translations for messages
            const currentLang = document.documentElement.getAttribute('lang') || 'ar';
            const msgSuccess = currentLang === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!';
            const msgError = currentLang === 'ar' ? 'حدث خطأ أثناء الإرسال، يرجى المحاولة لاحقاً.' : 'An error occurred, please try again later.';
            const msgLoading = currentLang === 'ar' ? 'جاري الإرسال...' : 'Sending...';

            // Map form fields
            const nameInput = form.querySelector('input[data-i18n-placeholder="field_name"]');
            const companyInput = form.querySelector('input[data-i18n-placeholder="field_company"]');
            const emailInput = form.querySelector('input[type="email"]');
            const phoneInput = form.querySelector('input[type="tel"]');
            const serviceInput = form.querySelector('input[data-i18n-placeholder="field_service"]');
            const governorateInput = form.querySelector('select[data-i18n-placeholder="field_governorate"]');
            const messageInput = form.querySelector('textarea');

            const payload = {
                data: {
                    name: nameInput?.value || '',
                    companyName: companyInput?.value || '',
                    email: emailInput?.value || '',
                    phone: parseInt(phoneInput?.value?.replace(/\D/g, '') || '0'),
                    serviceType: serviceInput?.value || '',
                    covernate: governorateInput?.value || '',
                    message: messageInput?.value || ''
                }
            };

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = msgLoading;

                const response = await fetch('http://localhost:1337/api/contacts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert(msgSuccess);
                    form.reset();
                    // Remove any remaining error messages after reset
                    form.querySelectorAll('.error-msg').forEach(el => el.remove());
                    form.querySelectorAll('.input-group.invalid').forEach(el => el.classList.remove('invalid'));
                } else {
                    const errorData = await response.json();
                    console.error('Server error details:', errorData);
                    throw new Error('Server error');
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert(msgError);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    });
});

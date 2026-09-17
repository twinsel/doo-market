  static async register(data: RegisterFormData): Promise<User> {
    await this.addRandomDelay();

    // ✅✅✅ تنظيف شامل من BOM والأحرف المخفية
    const clean = (s: string): string =>
      (s || '')
        .replace(/[\uFEFF\u200B-\u200D\u2060\uFFFE\uFFFF]/g, '')
        .replace(/^\s+|\s+$/g, '')
        .normalize('NFC');

    const cleanName = clean(data.name) || 'مستخدم';
    const cleanEmail = clean(data.email).toLowerCase();
    const cleanPhone = clean(data.phone || '');

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          data: {
            name: cleanName,
            phone: cleanPhone,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error(AUTH_MESSAGES.register.emailSent);
        }
        throw new Error(AUTH_MESSAGES.register.generalError);
      }

      if (!authData.user) {
        throw new Error(AUTH_MESSAGES.register.generalError);
      }

      const userId = authData.user.id;
      const newUser: User = {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role: 'buyer',
        createdAt: new Date().toISOString(),
      };

      await this.createUserProfile(userId, {
        ...data,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
      });
      await this.setUserRole(userId, 'buyer');

      return newUser;

    } catch (error) {
      if (error instanceof Error && error.message.includes('تم إرسال رابط')) {
        throw error;
      }
      throw new Error(AUTH_MESSAGES.register.generalError);
    }
  }
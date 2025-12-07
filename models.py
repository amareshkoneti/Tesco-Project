import google.generativeai as genai

genai.configure(api_key="AIzaSyBvzGKuTvmtpSXhWOj77fyCdz3XpuE0Qt0")

models = genai.list_models()

for m in models:
    print(m.name)

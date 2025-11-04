# ONE-LINER DISCOVERY COMMANDS

## 🚀 Easiest Option - Copy & Paste These:

### Quick Discovery (Recommended First)
```bash
bash /mnt/user-data/outputs/quick-discover.sh && cat /mnt/user-data/outputs/quick-discovery.txt
```

### Full Discovery (Comprehensive)
```bash
bash /mnt/user-data/outputs/discover-project.sh && cat /mnt/user-data/outputs/project-discovery-report.md
```

### Just Show Me Files (No Script Needed)
```bash
echo "=== SCHEMA FILES ===" && \
find /mnt/user-data/uploads -name "*.prisma" 2>/dev/null && \
echo "" && echo "=== PACKAGE.JSON ===" && \
find /mnt/user-data/uploads -name "package.json" 2>/dev/null && \
echo "" && echo "=== DATABASE FILES ===" && \
find /mnt/user-data/uploads -name "*db*.ts" -o -name "*prisma*.ts" 2>/dev/null | head -5 && \
echo "" && echo "=== SEARCH FILES ===" && \
find /mnt/user-data/uploads -name "*search*.ts*" 2>/dev/null | head -5
```

---

## 📋 Or Just Tell Me:

If scripts aren't working, just answer these 5 questions:

1. **What ORM are you using?**
   - [ ] Prisma only
   - [ ] Drizzle only  
   - [ ] Both (why?)
   - [ ] Other: ______

2. **What database?**
   - [ ] Neon PostgreSQL
   - [ ] Supabase
   - [ ] Railway
   - [ ] Other: ______

3. **What's your search using?**
   - [ ] pgvector (PostgreSQL extension)
   - [ ] Pinecone
   - [ ] Weaviate
   - [ ] OpenAI embeddings
   - [ ] Other: ______

4. **What AI/NLP library?**
   - [ ] OpenAI
   - [ ] Anthropic
   - [ ] LangChain
   - [ ] Custom
   - [ ] Other: ______

5. **How many tables do you currently have?**
   - [ ] Less than 10
   - [ ] 10-30
   - [ ] 30-50
   - [ ] More than 50

---

## 🎯 Fastest Path Forward

**OPTION A**: Run quick discovery
```bash
bash /mnt/user-data/outputs/quick-discover.sh
```
Then paste the output

**OPTION B**: Upload these 3 files:
1. Your schema file (`.prisma` or drizzle)
2. `package.json`
3. Your search implementation file

**OPTION C**: Just answer the 5 questions above

Any of these will work! Pick whatever is easiest for you. 🚀

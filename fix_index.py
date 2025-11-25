import os

file_path = r'c:\Users\user\.gemini\antigravity\scratch\assessment app\index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the second DOCTYPE
start_index = -1
for i, line in enumerate(lines):
    if '<!DOCTYPE html>' in line and i > 0:
        start_index = i
        break

if start_index == -1:
    print("Could not find second DOCTYPE")
    # Fallback: check if the file is already fixed (only one DOCTYPE)
    if '<!DOCTYPE html>' in lines[0]:
         print("File seems to be already fixed or only has one DOCTYPE at the start.")
         exit(0)
    else:
         print("Error: No DOCTYPE found or unexpected structure.")
         exit(1)

new_lines = lines[start_index:]

# Unindent
# Determine indentation of the first line
first_line = new_lines[0]
indentation = len(first_line) - len(first_line.lstrip())
print(f"Detected indentation: {indentation}")

final_lines = []
for line in new_lines:
    if len(line) > indentation and line.startswith(' ' * indentation):
        final_lines.append(line[indentation:])
    elif line.strip() == '':
        final_lines.append(line)
    else:
        # Line is shorter than indentation or doesn't start with spaces (unexpected)
        # Just lstrip it to be safe? Or keep as is?
        # If it's inside the block, it should be indented.
        # Let's just lstrip the specific amount if possible, else lstrip all leading spaces
        final_lines.append(line.lstrip())

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(final_lines)

print("Successfully fixed index.html")

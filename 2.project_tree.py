import os

def save_tree_structure(start_path, exclude_entries=None, output_file='PROJECT_TREE.md'):
	"""
	Recursively generates a tree structure of the directory contents starting from `start_path`
	and writes the output to a Markdown file wrapped in code fences.

	The output is enclosed within triple backticks (```) so that it renders as a formatted code block.
	A variety of emojis are used to represent different file types.

	Parameters:
	- start_path (str): The starting directory path.
	- exclude_entries (list, optional): Files or directories to exclude.
	- output_file (str, optional): The name of the output Markdown file.
	"""
	if exclude_entries is None:
		exclude_entries = [
			'desktop.ini',
			'node_modules',
			'.git',
			'dist',
			'.venv',
			'Image-ExifTool-13.26',
			'resources',
   			'Navigation.md',
			'.gitignore',
			'.gitattributes',
			'package-lock.json',
   			'2.project_tree.py',
      		'__pycache__',
			'PROJECT_CONTENTS.txt',
			'1.content_extract.py',
   			'PROJECT_TREE.md',
   			'__manual_conversion__',
      		'out',
        	'scripts',
			'.tools',
			'.TO-DO',
			'.Frameworks',
			'.Phiprompt Framework Docs',
		]

	file_emojis = {
		'.py': '🐍',
		'.js': '📜',
		'.json': '🔧',
		'.txt': '📄',
		'.md': '📝',
		'.html': '🌐',
		'.css': '🎨', 
		'.jpg': '🖼️',
		'.jpeg': '🖼️',
		'.png': '🖼️',
		'.gif': '🖼️',
		'.ico': '🖼️',
		'.mp3': '🎵',
		'.wav': '🎵',
		'.mp4': '🎞️',
		'.pdf': '📕',
		'.gdoc': '🗄️',
		'.xlsx': '🧮',
		'.psd': '🖌️',
		'.φ': '🔱',
  		'.agent': '🤖',
    	'.vsix': '🔌',
	}

	def get_file_emoji(filename):
		"""
		Returns an emoji representing the file based on text-based or extension-based mappings.
		"""
		filename_lower = filename.lower()

		text_mapping = {
			'readme': '📘',
			'license': '⚖️',
			'receipt': '🧾',
			'faq': '❓',
			'rules': '📖',
			'invitation': '💌',
			'agenda': '📅',
			'analytics': '📈',
			'brainstorming': '🧠',
			'insights': '🔎',
			'guidelines': 'ℹ️',
			'tools': '🛠️',
			'sponsor': '💵',
			'finished': '✅',
			'bot': '🤖',
			'data': '📊',
		}

		for pattern, emoji in text_mapping.items():
			if pattern in filename_lower:
				return emoji

		ext = os.path.splitext(filename)[1].lower()
		return file_emojis.get(ext, '📄')

	def walk_directory(directory, depth=0, prefix=''):
		"""
		Recursively walks the directory structure, building a list of strings representing
		each file and folder in a tree format.

		Parameters:
		- directory (str): The directory to traverse.
		- depth (int): The current recursion depth.
		- prefix (str): The string prefix for the current depth (used for formatting).

		Returns:
		- list of str: The formatted lines representing the tree structure.
		"""
		if any(excluded in directory for excluded in exclude_entries):
			return []

		tree_lines = []
		entries = os.listdir(directory)
		entries = [entry for entry in entries if entry not in exclude_entries]
		total_entries = len(entries)

		for idx, entry in enumerate(entries):
			full_path = os.path.join(directory, entry)
			is_last = idx == total_entries - 1
			symbol = '└─' if is_last else '├─'
			new_prefix = prefix + ('    ' if is_last else '│   ')

			if os.path.isdir(full_path):
				emoji = '📂'
				tree_lines.append(f'{prefix}{symbol} {emoji} {entry}')
				tree_lines.extend(walk_directory(full_path, depth + 1, new_prefix))
			else:
				emoji = get_file_emoji(entry)
				tree_lines.append(f'{prefix}{symbol} {emoji} {entry}')

		return tree_lines

	directory_structure = walk_directory(start_path)

	markdown_output = """<img src="https://banes-lab.com/assets/images/banes_lab/700px_Main_Animated.gif" width="70" />

## 📂 Project Structure
```\n""" + '\n'.join(directory_structure) + '\n```'

	with open(output_file, 'w', encoding='utf-8') as f:
		f.write(markdown_output)

	print(f'Folder structure has been saved to {output_file}')


if __name__ == '__main__':
	current_directory = os.getcwd()
	save_tree_structure(current_directory)

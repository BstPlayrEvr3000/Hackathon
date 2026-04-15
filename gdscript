extends MarginContainer

@onready var status_label: Label = $VBoxContainer/StatusLabel

@onready var heaps_label: Label = $VBoxContainer/StartRow/HeapsLabel
@onready var heaps_input: LineEdit = $VBoxContainer/StartRow/HeapsInput
@onready var start_button: Button = $VBoxContainer/StartRow/StartButton

@onready var heap_label: Label = $VBoxContainer/MoveRow/HeapLabel
@onready var heap_spin: SpinBox = $VBoxContainer/MoveRow/HeapSpin
@onready var amount_label: Label = $VBoxContainer/MoveRow/AmountLabel
@onready var amount_spin: SpinBox = $VBoxContainer/MoveRow/AmountSpin
@onready var move_button: Button = $VBoxContainer/MoveRow/MoveButton

@onready var board_row: HBoxContainer = $VBoxContainer/BoardRow

var piles: Array[int] = []
var game_active: bool = false
var bot_thinking: bool = false


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)

	# Visible text
	status_label.text = "Enter the starting heaps, then press Start Game."
	heaps_label.text = "Heaps:"
	start_button.text = "Start Game"
	heap_label.text = "Heap"
	amount_label.text = "Amount"
	move_button.text = "Make Move"

	# Prevent squishing
	heaps_input.custom_minimum_size = Vector2(180, 0)
	start_button.custom_minimum_size = Vector2(120, 0)
	heap_spin.custom_minimum_size = Vector2(70, 0)
	amount_spin.custom_minimum_size = Vector2(70, 0)
	move_button.custom_minimum_size = Vector2(130, 0)

	heaps_input.size_flags_horizontal = Control.SIZE_EXPAND_FILL

	# SpinBox settings
	heap_spin.min_value = 1
	heap_spin.step = 1
	heap_spin.rounded = true

	amount_spin.min_value = 1
	amount_spin.step = 1
	amount_spin.rounded = true

	# Initial disabled state
	move_button.disabled = true

	# Signals
	start_button.pressed.connect(_on_start_button_pressed)
	move_button.pressed.connect(_on_move_button_pressed)
	heap_spin.value_changed.connect(_on_heap_spin_value_changed)


func _on_start_button_pressed() -> void:
	if bot_thinking:
		return

	var parsed: Array[int] = _parse_piles(heaps_input.text)
	if parsed.is_empty():
		status_label.text = "Invalid input. Use positive integers, for example: 3 5 2"
		return

	piles = parsed
	game_active = true
	move_button.disabled = false

	heap_spin.max_value = piles.size()
	heap_spin.value = 1
	_refresh_amount_spin()
	_rebuild_board()

	var nimsum: int = _nim_sum(piles)
	if nimsum == 0:
		status_label.text = "You will be first."
	else:
		status_label.text = "You will be second."
		await _bot_turn()


func _on_move_button_pressed() -> void:
	if not game_active or bot_thinking:
		return

	var heap: int = int(heap_spin.value) - 1
	var amount: int = int(amount_spin.value)

	if heap < 0 or heap >= piles.size():
		status_label.text = "Invalid heap."
		return

	if amount < 1 or amount > piles[heap]:
		status_label.text = "Invalid amount."
		return

	piles[heap] -= amount
	_rebuild_board()

	if _all_empty():
		status_label.text = "You win!"
		game_active = false
		move_button.disabled = true
		return

	await _bot_turn()


func _on_heap_spin_value_changed(_value: float) -> void:
	_refresh_amount_spin()


func _parse_piles(text: String) -> Array[int]:
	var result: Array[int] = []
	var parts: PackedStringArray = text.strip_edges().split(" ", false)

	for part in parts:
		if not part.is_valid_int():
			return []

		var value: int = int(part)
		if value <= 0:
			return []

		result.append(value)

	return result


func _nim_sum(state: Array[int]) -> int:
	var total: int = 0
	for p in state:
		total ^= p
	return total


func _play_game(state: Array[int]) -> Array[int]:
	var total: int = _nim_sum(state)

	if total == 0:
		return [-1, 0]

	for heap in range(state.size()):
		var target: int = state[heap] ^ total
		if target < state[heap]:
			return [heap, state[heap] - target]

	return [-1, 0]


func _bot_turn() -> void:
	bot_thinking = true
	move_button.disabled = true
	start_button.disabled = true

	status_label.text = "Bot is thinking..."
	await get_tree().create_timer(1.0).timeout

	var move: Array[int] = _play_game(piles)
	var bot_heap: int = move[0]
	var bot_amount: int = move[1]

	if bot_heap == -1:
		status_label.text = "No winning bot move found."
		game_active = false
		move_button.disabled = true
		start_button.disabled = false
		bot_thinking = false
		return

	piles[bot_heap] -= bot_amount
	_rebuild_board()

	if _all_empty():
		status_label.text = "The bot took %d from heap %d. You lose!... it's rigged anyway" % [bot_amount, bot_heap + 1]
		game_active = false
		move_button.disabled = true
	else:
		status_label.text = "The bot took %d from heap %d. Your move." % [bot_amount, bot_heap + 1]
		move_button.disabled = false

	start_button.disabled = false
	bot_thinking = false


func _all_empty() -> bool:
	for p in piles:
		if p != 0:
			return false
	return true


func _refresh_amount_spin() -> void:
	if piles.is_empty():
		amount_spin.max_value = 1
		amount_spin.value = 1
		return

	var heap_index: int = clampi(int(heap_spin.value) - 1, 0, piles.size() - 1)
	var max_amount: int = maxi(1, piles[heap_index])

	amount_spin.max_value = max_amount
	if amount_spin.value > max_amount:
		amount_spin.value = max_amount
	if amount_spin.value < 1:
		amount_spin.value = 1


func _rebuild_board() -> void:
	for child in board_row.get_children():
		child.queue_free()

	for i in range(piles.size()):
		board_row.add_child(_make_heap_visual(i, piles[i]))

	_refresh_amount_spin()


func _make_heap_visual(heap_index: int, count: int) -> VBoxContainer:
	var heap_box: VBoxContainer = VBoxContainer.new()
	heap_box.custom_minimum_size = Vector2(100, 340)
	heap_box.alignment = BoxContainer.ALIGNMENT_END
	heap_box.add_theme_constant_override("separation", 4)

	for _j in range(count):
		heap_box.add_child(_make_domino())

	var label: Label = Label.new()
	label.text = "Heap %d: %d" % [heap_index + 1, count]
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	heap_box.add_child(label)

	return heap_box


func _make_domino() -> Panel:
	var tile: Panel = Panel.new()
	tile.custom_minimum_size = Vector2(80, 24)

	var style: StyleBoxFlat = StyleBoxFlat.new()
	style.bg_color = Color.WHITE
	style.border_color = Color.BLACK
	style.set_border_width_all(2)
	style.corner_radius_top_left = 2
	style.corner_radius_top_right = 2
	style.corner_radius_bottom_left = 2
	style.corner_radius_bottom_right = 2

	tile.add_theme_stylebox_override("panel", style)
	return tile

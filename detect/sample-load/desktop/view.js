Todos.StatsView = Ember.View.extend({
  remainingBinding: 'Todos.todosController.remaining',
  remainingString: function() {
    var remaining = this.get('remaining');
    return remaining + (remaining === 1 ? " item" : " items");
  }.property('remaining')
});

Todos.CreateTodoView = Ember.TextField.extend({
  insertNewline: function() {
    var value = this.get('value');

    if (value) {
      Todos.todosController.createTodo(value);
      this.set('value', '');
    }
  }
});

Todos.ClearCompletedButtonView = Ember.Button.extend({
  completedBinding: 'Todos.todosController.completed',
  completedString: function() {
    var completed = this.get('completed');
    return completed + " completed" + (completed === 1 ? " item" : " items");
  }.property('completed'),

  completedButtonClass: function () {
      if (this.get('completed') < 1)
          return 'hidden';
      else
          return '';
  }.property('completed')
});


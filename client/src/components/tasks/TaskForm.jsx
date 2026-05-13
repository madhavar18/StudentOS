// TaskForm.jsx
// WHY a seperate component: the form has its own local state (input values, 
// validation errors, loading state). None of this belongs in App.jsx
// App.jsx only needs to know ONE thing from this component: 
// "a new task was created, here it is." That's communicated via onTaskCreated prop.
// Everything else - what the user typed, whether the form is valid,
// whether the submit is in progress - is local to this component.

import { useState } from "react";
import { createTask } from '../../services/taskService';

// WHY these specific fields:
// title, type, deadline - required by your mongoose schema
// priority - has a default ('medium') so optional
// notes - completely optional
const INITIAL_FORM_STATE = {
    title: '',
    type: '',
    deadline:'',
    priority: 'medium',
    notes: ''
};

function TaskForm({ onTaskCreated, onCancel }) {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState('');

    // Single change handler for all fields
    // WHY computed property name [e.target.name] 
    // Instead of writing a seperate handler for each field
    // (handleTitleChange, handleTypeChange, etc.),
    // one handler updates any field by name
    // e.target.name must match the key in formData exactly

    function handleChange(e) {
        const {name, value} = e.target;
        setFormData(prev => ({ ...prev, [name]: value}));
        // Clear the error for this field as user types
        // WHY: immediate feedback - error disappears as soon as the field is valid
        if(errors[name]) {
            setErrors(prev => ({ ...prev, [name]: ''}));
        }
        setServerError('');
    }

    // Client-side validation
    // WHY validate on client AND server:
    // Server validation (Mongoose Schema) is the security guarantee - 
    // it runs even if someone bypasses your UI with curl.
    // Client validation is UX - it gives instant feedback
    // without a round trip to the server.
    // Both are necessary. Client alone = insecure. Server alone - bad UX.
    function validate() {
        const newErrors = {};

        if(!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if(formData.title.trim().length > 300) {
            newErrors.title = 'Title cannot exceed 300 characters';
        }

        if(!formData.type) {
            newErrors.type = 'Task type is required';
        }

        if(!formData.deadline) {
            newErrors.deadline = 'Deadline is required';
        }

        return newErrors;
    }

    async function handleSubmit(e) {
        e.preventDefault(); // prevent default form submission (page reload)
        // WHY e.preventDefault(): HTML forms submit to a URL by default,
        // reloading the page. React handles submission — we prevent the default

        const validationErrors = validate();
        if(Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return; // don't submit if client validation fails
        }

        setSubmitting(true);
        setServerError('');

        try {
            // createTask sends POST /api/tasks with formData as the body
            const newTask = await createTask({
                title: formData.title.trim(),
                type: formData.type,
                deadline: formData.deadline,
                priority: formData.priority,
                notes: formData.notes.trim()
            });

            // Reset form to initial state after successful creation
            setFormData(INITIAL_FORM_STATE);
            setErrors({});

            // Notify parent (App.jsx) that a new task was created
            // Pass the new task so App.jsx can add it to the list
            // without another API call
            onTaskCreated(newTask);
        } catch (error) {
            // server returned an error (validation failed, network error, etc.)
            // handleResponse in taskService throws with the server's message
            setServerError(error.message);
        } finally {
            // Always reset submitting - whether success or failure
            setSubmitting(false);
        }
    }

    // Get today's date in yyyy-mm-dd format for the min attribute
    // WHY min: prevents selecting dates in the past for new tasks
    // (though overdue tasks from the server sre still valid - this is only for new ones)
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="task-form-overlay">
            <div className="task-form-container">
                <div className="task-form-header">
                    <h2>Create New Task</h2>
                    <button
                        className="close-btn"
                        onClick={onCancel}
                        type="button"
                        aria-label="Close form"
                    >
                        ✕
                    </button>
                </div>

                {serverError && (
                    <div className="form-server-error">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    {/* Title */}
                    <div className="form-group">
                        <label htmlFor="title">
                            Task Title <span className="required">*</span>
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Complete React assignment"
                            className={errors.title ? 'input-error' : ''}
                            disabled={submitting}
                            autoFocus
                        />
                        {errors.title && (
                            <span className="field-error">{errors.title}</span>
                        )}
                    </div>

                    {/* Type */}
                    <div className="form-group">
                        <label htmlFor="type">
                            Task Type <span className="required">*</span>
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className={errors.type ? 'input-error' : ''}
                            disabled={submitting}
                        >
                            <option value="">Select type...</option>
                            <option value="Assignment">Assignment</option>
                            <option value="Exam">Exam</option>
                            <option value="Project">Project</option>
                        </select>
                        {errors.type && (
                            <span className="field-error">{errors.type}</span>
                        )}
                    </div>

                    {/* Deadline */}
                    <div className="form-group">
                        <label htmlFor="deadline">
                            Deadline <span className="required">*</span>
                        </label>
                        <input
                            id="deadline"
                            name="deadline"
                            type="date"
                            value={formData.deadline}
                            onChange={handleChange}
                            min={today}
                            className={errors.deadline ? 'input-error' : ''}
                            disabled={submitting}
                        />
                        {errors.deadline && (
                            <span className="field-error">{errors.deadline}</span>
                        )}
                    </div>

                    {/* Priority */}
                    <div className="form-group">
                        <label htmlFor="priority">Priority</label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            disabled={submitting}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label htmlFor="notes">Notes (optional)</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Any additional details..."
                            rows={3}
                            disabled={submitting}
                        />
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn-cancel"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={submitting}
                        >
                            {submitting ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TaskForm;
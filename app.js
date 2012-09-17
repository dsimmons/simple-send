var SimpleSend = {
    start: function() {
        this.app = new this.MessageView();
        return this.app;
    }
}

SimpleSend.Message = Backbone.Model.extend({

    url: 'https://mandrillapp.com/api/1.0/messages/send.json',

    defaults: {
        key: '',
        message: {
            text: '',
            subject: '',
            from_email: '',
            to: [{
                email: ''
            }],
            track_opens: true,
            track_clicks: true,
        }
    }
});

SimpleSend.PDFAttachment = Backbone.Model.extend({

    download: function(url) {
        var deferred = $.Deferred(),
            _this = this,
            result = url.match(/[^/]+$/i),
            name = (result && result.length) ? result[0] : 'No Name';

        PDFJS.disableWorker = true;
        PDFJS.getDocument(url).then(function(pdf) {
            var data = pdf.getData()._data,
                base64 = ''

            for (var i = 0; i < data.byteLength; i++) {
                base64 += String.fromCharCode(data[i]);
            }

            _this.set([{
                content: btoa(base64),
                name: name,
                type: 'application/pdf'
            }]);
            deferred.resolve();
        });
        return deferred.promise();
    }
});

SimpleSend.MessageView = Backbone.View.extend({

    el: $('#emailForm'),

    initialize: function() {
        this.model = new SimpleSend.Message();
    },

    events: {
        'click #clearEmail': function() {
            this.$('input').each( function() { $(this).val(''); });
            this.$('textarea').each( function() { $(this).val(''); });
        },
        'click #sendEmail': 'sendEmail'
    },

    sendEmail: function(click) {
        var btn = $(click.currentTarget).button('loading'),
            _this = this;

        successCallback = function(data, statusText, jqXHR) {
            btn.button('success').removeClass('btn-primary btn-danger').addClass('btn-success');
            doneCallback(statusText, jqXHR);
        };

        failCallback = function(data, statusText, jqXHR) {
            btn.button('fail').removeClass('btn-primary btn-success').addClass('btn-danger');
            doneCallback(statusText, jqXHR);
        };

        doneCallback = function(statusText, jqXHR) {
            console.log(statusText, jqXHR);
            setTimeout(function() {
                btn.button('reset')
                    .removeClass('btn-danger btn-success')
                    .addClass('btn-primary');
            }, 3000);
            this.$('#clearEmail').click();
            this.$('input:first').focus();
        }

        $.when(this.serialize()).pipe( function() {
            _this.model.save().then(successCallback, failCallback)
        });
    },

    serialize: function() {
        var vals = {
            key: this.$('#apiKey').val(),
            message: {
                text: this.$('#emailContents').val(),
                subject: this.$('#emailSubject').val(),
                from_email: this.$('#emailFrom').val(),
                to: [
                    { email: this.$('#emailTo').val() }
                ],
            }
        };

        var promise, attachmentURL = this.$('#emailAttachment').val();
        if (attachmentURL) {
            var attachment = vals.message.attachments = new SimpleSend.PDFAttachment();
            promise = attachment.download(attachmentURL);
        }

        this.model.set(vals);
        return promise;
    }
});

$(function() {
    SimpleSend.start();
    var app = SimpleSend.app;
});
